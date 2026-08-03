import {
  createConnection,
  TextDocuments,
  Diagnostic,
  InitializeParams,
  CompletionItem,
  TextDocumentSyncKind,
  InitializeResult,
  MessageReader,
  MessageWriter,
  SemanticTokensParams,
  CompletionParams,
  SemanticTokens,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  makeSemanticTokensFullResponse,
  tokenModifierMap,
  tokenTypeMap,
} from './semanticToken';
import { complete, checkTriggerCompletion } from './completion';
import { collectDiagnostics } from './diagnostics';
import { ScannerService } from './third-party/scanner.service';
import { UserDataService } from '../user-data/user-data.service';
import { webgalParser } from '../../util/webgal-parser';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

export function createWsConnection(
  reader: MessageReader,
  writer: MessageWriter,
) {
  const connection = createConnection(reader, writer);
  const documents: TextDocuments<TextDocument> = new TextDocuments(
    TextDocument,
  );

  const scanner = new ScannerService();
  let currentMode: 'native' | 'third-party' = 'native';
  let activeLauncher: any = null;
  let activeLauncherId: string | null = null;
  let activeConnection: any = null;

  let basePath = '';
  let currentWorkspaceUri: string | null = null;

  const uriMap = new Map<string, string>(); // original -> file
  const reverseUriMap = new Map<string, string>(); // file -> original

  const logError = (msg: string) => {
    connection.console.error(`[LSP] ${msg}`);
  };

  const CONTROL_METHODS = [
    'textDocument/setBasePath',
    '$/scanLanguageServers',
    '$/setActiveLanguageServer',
    '$/getActiveLanguageServer',
  ];

  const isThirdPartyActive = (): boolean => {
    return currentMode === 'third-party' && activeConnection !== null;
  };

  const stripFileProtocol = (uriPath: string): string => {
    if (!uriPath) return '';
    let pathWithoutScheme = uriPath.replace(/^file:\/\/\/?/, '');
    try {
      pathWithoutScheme = decodeURI(pathWithoutScheme);
    } catch {
      // ignore
    }
    if (process.platform === 'win32') {
      pathWithoutScheme = pathWithoutScheme.replace(/\//g, '\\');
    }
    return pathWithoutScheme;
  };

  const normalizeUri = (originalUri: string): string => {
    if (originalUri.startsWith('file://')) {
      const pathPart = originalUri.replace(/^file:\/\/\/?/, '');
      if (/^[A-Za-z]:[\\/]/i.test(pathPart) || pathPart.startsWith('/')) {
        try {
          const decoded = decodeURI(pathPart);
          if (/^[A-Za-z]:[\\/]/i.test(decoded) || decoded.startsWith('/')) {
            return originalUri;
          }
        } catch { }
      }
    }

    const state = UserDataService.getState();
    let relativePath = originalUri.replace(/^file:\/\/\/?/, '').replace(/^\/+/, '');
    if (originalUri.includes('://') && !originalUri.startsWith('file://')) {
      relativePath = originalUri.split('://')[1] || '';
    }
    if (!relativePath) {
      return originalUri;
    }
    let decodedRelativePath = relativePath;
    try {
      decodedRelativePath = decodeURI(relativePath);
    } catch { }
    const absolutePath = path.resolve(state.activeUserDataRoot, decodedRelativePath);
    const fileUri = pathToFileURL(absolutePath).toString();
    return fileUri;
  };

  const getFileUri = (originalUri: string): string => {
    let fileUri = uriMap.get(originalUri);
    if (!fileUri) {
      fileUri = normalizeUri(originalUri);
      if (fileUri !== originalUri) {
        uriMap.set(originalUri, fileUri);
        reverseUriMap.set(fileUri, originalUri);
      }
    }
    return fileUri;
  };

  const stopThirdPartyServer = async (): Promise<void> => {
    if (activeLauncher) {
      try {
        await activeLauncher.stop?.();
      } catch { }
    }
    try {
      activeConnection?.dispose?.();
    } catch { }
    activeConnection = null;
    activeLauncher = null;
    activeLauncherId = null;
    currentMode = 'native';
    currentWorkspaceUri = null;
    uriMap.clear();
    reverseUriMap.clear();
  };

  const forwardToThirdParty = (method: string, params: any, token?: any) => {
    if (!isThirdPartyActive()) return undefined;
    return activeConnection.sendRequest(method, params, token);
  };

  const notifyThirdParty = (method: string, params?: any) => {
    if (!isThirdPartyActive()) return;
    if (params && params.textDocument && params.textDocument.uri) {
      const originalUri = params.textDocument.uri;
      const fileUri = getFileUri(originalUri);
      if (fileUri !== originalUri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    activeConnection.sendNotification(method, params);
  };

  const attachThirdPartyEvents = (): void => {
    if (!isThirdPartyActive()) return;

    activeConnection.onRequest(async (method: string, params: any, token: any) => {
      if (method.startsWith('workspace/fs/')) {
        try {
          const rawPath = params.path;
          const normalizedPath = stripFileProtocol(rawPath);
          if (!normalizedPath) {
            throw new Error('Empty path after stripping file protocol');
          }
          let result: any;
          switch (method) {
            case 'workspace/fs/readFile':
              result = await fs.promises.readFile(normalizedPath, 'utf8');
              break;
            case 'workspace/fs/readDirectory': {
              const entries = await fs.promises.readdir(normalizedPath, { withFileTypes: true });
              result = entries.map((entry) => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
              }));
              break;
            }
            case 'workspace/fs/exists': {
              try {
                const s = await fs.promises.stat(normalizedPath);
                result = { exists: true, isDirectory: s.isDirectory() };
              } catch {
                result = { exists: false, isDirectory: false };
              }
              break;
            }
            default:
              throw new Error(`Unsupported workspace/fs method: ${method}`);
          }
          return result;
        } catch (err) {
          logError(`workspace/fs error: ${err}`);
          throw err;
        }
      }
      return connection.sendRequest(method, params, token);
    });

    activeConnection.onNotification(
      'textDocument/publishDiagnostics',
      (params: any) => {
        const fileUri = params.uri;
        const originalUri = reverseUriMap.get(fileUri) || fileUri;
        if (originalUri !== fileUri) {
          (params as any).uri = originalUri;
        }
        connection.sendDiagnostics(params);
      },
    );

    activeConnection.onRequest(
      'window/showMessageRequest',
      (params: any, token: any) => {
        return connection.sendRequest('window/showMessageRequest', params, token);
      },
    );
    activeConnection.onRequest(
      'window/showDocument',
      (params: any, token: any) => {
        return connection.sendRequest('window/showDocument', params, token);
      },
    );
    activeConnection.onRequest(
      'workspace/applyEdit',
      (params: any, token: any) => {
        return connection.sendRequest('workspace/applyEdit', params, token);
      },
    );
    activeConnection.onRequest(
      'workspace/configuration',
      (params: any, token: any) => {
        return connection.sendRequest('workspace/configuration', params, token);
      },
    );
    activeConnection.onNotification('window/showMessage', (params: any) => {
      connection.sendNotification('window/showMessage', params);
    });
  };

  const startThirdPartyServer = async (id: string): Promise<void> => {
    await stopThirdPartyServer();

    const launcher = scanner.getLauncherById(id);
    if (!launcher) {
      throw new Error(`Third-party language server not found: ${id}`);
    }

    const { reader, writer } = await launcher.start();
    const thirdPartyConnection = createConnection(reader, writer);
    thirdPartyConnection.listen();

    const state = UserDataService.getState();
    const defaultRootUri = pathToFileURL(state.activeUserDataRoot).toString();
    const initParams: InitializeParams = {
      processId: process.pid,
      rootUri: defaultRootUri,
      workspaceFolders: [],
      capabilities: {},
    };

    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        await thirdPartyConnection.sendRequest('initialize', initParams);
        break;
      } catch (err: any) {
        if (err.message === 'Call listen() first.' && retries < maxRetries - 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        await stopThirdPartyServer();
        throw err;
      }
    }

    thirdPartyConnection.sendNotification('initialized', {});

    activeConnection = thirdPartyConnection;
    activeLauncher = launcher;
    activeLauncherId = id;
    currentMode = 'third-party';

    attachThirdPartyEvents();

    if (basePath) {
      updateWorkspaceFolders(basePath);
    }

    for (const document of documents.all()) {
      const fileUri = getFileUri(document.uri);
      thirdPartyConnection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: fileUri,
          languageId: document.languageId,
          version: document.version,
          text: document.getText(),
        },
      });
    }
  };

  const updateWorkspaceFolders = (newBasePath: string) => {
    if (!isThirdPartyActive()) return;
    try {
      const state = UserDataService.getState();
      let newWorkspaceUri: string | null = null;
      if (newBasePath && newBasePath.trim() !== '') {
        const absolutePath = path.resolve(state.activeUserDataRoot, newBasePath);
        newWorkspaceUri = pathToFileURL(absolutePath).toString();
      }
      if (newWorkspaceUri === currentWorkspaceUri) return;
      const added: any[] = [];
      const removed: any[] = [];
      if (newWorkspaceUri) {
        added.push({ uri: newWorkspaceUri, name: path.basename(newWorkspaceUri) });
      }
      if (currentWorkspaceUri) {
        removed.push({ uri: currentWorkspaceUri, name: path.basename(currentWorkspaceUri) });
      }
      activeConnection.sendNotification('workspace/didChangeWorkspaceFolders', {
        event: { added, removed },
      });
      currentWorkspaceUri = newWorkspaceUri;
    } catch (err) {
      logError(`updateWorkspaceFolders error: ${err}`);
    }
  };

  process.on('exit', async () => {
    if (currentMode === 'third-party') {
      await stopThirdPartyServer();
    }
  });

  const isControlMethod = (method: string): boolean =>
    CONTROL_METHODS.includes(method);

  const tryForwardRequest = (method: string, params: any, token?: any) => {
    if (!isThirdPartyActive()) return undefined;
    if (params && params.textDocument && params.textDocument.uri) {
      const originalUri = params.textDocument.uri;
      const fileUri = getFileUri(originalUri);
      if (fileUri !== originalUri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    return forwardToThirdParty(method, params, token);
  };

  const THIRD_PARTY_REQUESTS_FORWARDS = [
    'completionItem/resolve',
    'textDocument/hover',
    'textDocument/signatureHelp',
    'textDocument/declaration',
    'textDocument/definition',
    'textDocument/typeDefinition',
    'textDocument/implementation',
    'textDocument/references',
    'textDocument/documentHighlight',
    'textDocument/documentSymbol',
    'workspace/symbol',
    'workspace/executeCommand',
    'textDocument/codeAction',
    'textDocument/codeLens',
    'codeLens/resolve',
    'textDocument/documentLink',
    'documentLink/resolve',
    'textDocument/documentColor',
    'textDocument/colorPresentation',
    'textDocument/formatting',
    'textDocument/rangeFormatting',
    'textDocument/onTypeFormatting',
    'textDocument/rename',
    'textDocument/prepareRename',
    'textDocument/foldingRange',
    'textDocument/selectionRange',
    'textDocument/semanticTokens/full',
    'textDocument/semanticTokens/range',
  ];

  THIRD_PARTY_REQUESTS_FORWARDS.forEach((method) => {
    connection.onRequest(method, (params: any, token: any) => {
      return tryForwardRequest(method, params, token);
    });
  });

  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;
  let hasConfigurationCapability = false;

  const BASE_CAPABILITIES: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['-', ':', '{', '/'],
      },
      semanticTokensProvider: {
        full: true,
        range: false,
        documentSelector: null,
        legend: {
          tokenTypes: Array.from(tokenTypeMap.keys()),
          tokenModifiers: Array.from(tokenModifierMap.keys()),
        },
      },
    },
  };

  connection.onInitialize(async (params: InitializeParams) => {
    const clientCapabilities = params.capabilities;
    hasWorkspaceFolderCapability = !!(
      clientCapabilities.workspace &&
      !!clientCapabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      clientCapabilities.textDocument &&
      clientCapabilities.textDocument.publishDiagnostics &&
      clientCapabilities.textDocument.publishDiagnostics.relatedInformation
    );
    hasConfigurationCapability = !!(
      clientCapabilities.workspace &&
      !!clientCapabilities.workspace.configuration
    );

    if (isThirdPartyActive()) {
      return await activeConnection.sendRequest('initialize', params);
    }

    const serverCapabilities = BASE_CAPABILITIES;
    if (hasWorkspaceFolderCapability) {
      serverCapabilities.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return serverCapabilities;
  });

  connection.onInitialized(() => {
    if (isThirdPartyActive()) {
      activeConnection.sendNotification('initialized');
    }
  });

  connection.onRequest(
    'textDocument/setBasePath',
    (params: { basePath: string }) => {
      const newBasePath = params.basePath;
      if (newBasePath !== basePath) {
        basePath = newBasePath;
        if (isThirdPartyActive()) {
          updateWorkspaceFolders(basePath);
          activeConnection.sendNotification('textDocument/setBasePath', { basePath });
        }
      }
    },
  );

  connection.onRequest('$/scanLanguageServers', async () => {
    try {
      const result = await scanner.scanServers();
      return { servers: result.servers };
    } catch (error) {
      connection.console.error(`Scanning language servers failed: ${error}`);
      return { servers: [] };
    }
  });

  connection.onRequest('$/getActiveLanguageServer', async () => {
    return {
      mode: currentMode,
      activeId: currentMode === 'third-party' ? activeLauncherId : 'native',
    };
  });

  connection.onRequest(
    '$/setActiveLanguageServer',
    async (params: { id?: string }) => {
      const id = params.id;
      if (!id || id === 'native') {
        await stopThirdPartyServer();
        return { success: true };
      }
      await startThirdPartyServer(id);
      return { success: true };
    },
  );

  connection.onRequest(
    'textDocument/semanticTokens/full',
    async (params: SemanticTokensParams): Promise<SemanticTokens> => {
      if (isThirdPartyActive()) {
        const originalUri = params.textDocument.uri;
        const fileUri = getFileUri(originalUri);
        if (fileUri !== originalUri) {
          (params.textDocument as any).uri = fileUri;
        }
        return await activeConnection.sendRequest(
          'textDocument/semanticTokens/full',
          params,
        );
      }
      const result = makeSemanticTokensFullResponse(
        params,
        documents.get(params.textDocument.uri),
      );
      return result;
    },
  );

  interface ExampleSettings {
    maxNumberOfProblems: number;
  }

  const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
  let globalSettings: ExampleSettings = defaultSettings;
  const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

  connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
      documentSettings.clear();
    } else {
      globalSettings = <ExampleSettings>(
        (change.settings.languageServerExample || defaultSettings)
      );
    }
    documents.all().forEach(validateTextDocument);
  });

  function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
    if (!hasConfigurationCapability) {
      return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
      result = connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'languageServerExample',
      });
      documentSettings.set(resource, result);
    }
    return result;
  }

  connection.onDidCloseTextDocument((params) => {
    documentSettings.delete(params.textDocument.uri);
    if (isThirdPartyActive()) {
      const fileUri = getFileUri(params.textDocument.uri);
      notifyThirdParty('textDocument/didClose', {
        textDocument: { uri: fileUri },
      });
    }
  });

  documents.onDidChangeContent(async (change) => {
    if (isThirdPartyActive()) {
      const fileUri = getFileUri(change.document.uri);
      notifyThirdParty('textDocument/didChange', {
        textDocument: {
          uri: fileUri,
          version: change.document.version,
        },
        contentChanges: [{ text: change.document.getText() }],
      });
      return;
    }
    await validateTextDocument(change.document);
  });

  async function validateTextDocument(
    textDocument: TextDocument,
  ): Promise<void> {
    if (isThirdPartyActive()) return;
    const settings = await getDocumentSettings(textDocument.uri);
    const diagnostics: Diagnostic[] = collectDiagnostics(
      textDocument.getText(),
      textDocument.uri,
    );
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }

  documents.onDidChangeContent(async (params) => {
    checkTriggerCompletion(params, () => {
      connection.sendRequest('textDocument/completion');
    });
  });

  connection.onCompletion(
    async (params: CompletionParams): Promise<CompletionItem[]> => {
      if (isThirdPartyActive()) {
        const fileUri = getFileUri(params.textDocument.uri);
        (params.textDocument as any).uri = fileUri;
        try {
          return await activeConnection.sendRequest(
            'textDocument/completion',
            params,
          );
        } catch (err) {
          logError(`Third-party completion failed: ${err}`);
          return [];
        }
      }
      const document = documents.get(params.textDocument.uri);
      return await complete(params, document, basePath);
    },
  );

  connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    return item;
  });

  documents.onDidOpen((event) => {
    if (!isThirdPartyActive()) return;
    const fileUri = getFileUri(event.document.uri);
    notifyThirdParty('textDocument/didOpen', {
      textDocument: {
        uri: fileUri,
        languageId: event.document.languageId,
        version: event.document.version,
        text: event.document.getText(),
      },
    });
  });

  documents.onDidClose((event) => {
    if (!isThirdPartyActive()) return;
    const fileUri = getFileUri(event.document.uri);
    notifyThirdParty('textDocument/didClose', {
      textDocument: { uri: fileUri },
    });
  });

  documents.listen(connection);
  connection.listen();
}
