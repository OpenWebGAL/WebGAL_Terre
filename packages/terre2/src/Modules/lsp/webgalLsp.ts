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
import * as fs from 'fs';

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

  const log = (msg: string) => connection.console.log(`[LSP] ${msg}`);
  const logError = (msg: string) => connection.console.error(`[LSP] ${msg}`);

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
    const withoutProtocol = uriPath.replace(/^file:\/\/\/?/, '');
    return withoutProtocol.replace(/\//g, '\\');
  };

  const stopThirdPartyServer = async (): Promise<void> => {
    if (activeLauncher) {
      try {
        await activeLauncher.stop?.();
      } catch (e) {
        // ignore
      }
    }
    try {
      activeConnection?.dispose?.();
    } catch {
      // ignore
    }
    activeConnection = null;
    activeLauncher = null;
    activeLauncherId = null;
    currentMode = 'native';
  };

  const forwardToThirdParty = (method: string, params: any, token?: any) => {
    if (!isThirdPartyActive()) return undefined;
    return activeConnection.sendRequest(method, params, token);
  };

  const notifyThirdParty = (method: string, params?: any) => {
    if (!isThirdPartyActive()) return;
    activeConnection.sendNotification(method, params);
  };

  const attachThirdPartyEvents = (): void => {
    if (!isThirdPartyActive()) return;

    activeConnection.onRequest(async (method: string, params: any, token: any) => {
      if (method.startsWith('workspace/fs/')) {
        try {
          const normalizedPath = stripFileProtocol(params.path);
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
        connection.sendDiagnostics(params);
      },
    );

    activeConnection.onRequest(
      'window/showMessageRequest',
      (params: any, token: any) => {
        return connection.sendRequest(
          'window/showMessageRequest',
          params,
          token,
        );
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

    activeConnection.onUnhandledNotification((message: any) => {
      if (message.method === 'textDocument/publishDiagnostics') return;
      connection.sendNotification(message.method, message.params);
    });
  };

  const startThirdPartyServer = async (id: string): Promise<void> => {
    log(`Starting third-party server: ${id}`);
    await stopThirdPartyServer();

    const launcher = scanner.getLauncherById(id);
    if (!launcher) {
      logError(`Launcher not found: ${id}`);
      throw new Error(`Third-party language server not found: ${id}`);
    }

    const { reader, writer } = await launcher.start();
    const thirdPartyConnection = createConnection(reader, writer);

    thirdPartyConnection.listen();

    const state = UserDataService.getState();
    const rootUri = 'file:///' + state.activeUserDataRoot.replace(/\\/g, '/');
    const initParams: InitializeParams = {
      processId: process.pid,
      rootUri,
      workspaceFolders: [{ uri: rootUri, name: 'Terre Workspace' }],
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
        logError(`Initialize failed: ${err}`);
        await stopThirdPartyServer();
        throw err;
      }
    }

    thirdPartyConnection.sendNotification('initialized', {});
    log(`Initialized successfully`);

    activeConnection = thirdPartyConnection;
    activeLauncher = launcher;
    activeLauncherId = id;
    currentMode = 'third-party';

    attachThirdPartyEvents();

    for (const document of documents.all()) {
      thirdPartyConnection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: document.uri,
          languageId: document.languageId,
          version: document.version,
          text: document.getText(),
        },
      });
    }
    log(`Server started, ${documents.all().length} documents synced`);
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
      return;
    }
  });

  connection.onRequest(
    'textDocument/setBasePath',
    (params: { basePath: string }) => {
      basePath = params.basePath;
      if (isThirdPartyActive()) {
        activeConnection.sendNotification('textDocument/setBasePath', { basePath });
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
      notifyThirdParty('textDocument/didClose', {
        textDocument: { uri: params.textDocument.uri },
      });
    }
  });

  documents.onDidChangeContent(async (change) => {
    if (isThirdPartyActive()) {
      notifyThirdParty('textDocument/didChange', {
        textDocument: {
          uri: change.document.uri,
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
    if (isThirdPartyActive()) {
      return;
    }
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
        return await activeConnection.sendRequest(
          'textDocument/completion',
          params,
        );
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
    notifyThirdParty('textDocument/didOpen', {
      textDocument: {
        uri: event.document.uri,
        languageId: event.document.languageId,
        version: event.document.version,
        text: event.document.getText(),
      },
    });
  });

  documents.onDidClose((event) => {
    if (!isThirdPartyActive()) return;
    notifyThirdParty('textDocument/didClose', {
      textDocument: {
        uri: event.document.uri,
      },
    });
  });

  documents.listen(connection);
  connection.listen();
}
