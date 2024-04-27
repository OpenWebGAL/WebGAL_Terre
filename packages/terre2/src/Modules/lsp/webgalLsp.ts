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

export const lastVariables = new Map<string, number>();

export function createWsConnection(
  reader: MessageReader,
  writer: MessageWriter,
) {
  // Create a connection for the server. Also include all preview / proposed
  // LSP features.
  const connection = createConnection(reader, writer);
  // Create a simple text document manager.
  const documents: TextDocuments<TextDocument> = new TextDocuments(
    TextDocument,
  );

  let basePath = '';

  const hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;

  const BASE_CAPABILITIES: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['-', ':', '{'],
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

  /***************************** INITIALIZATION ******************************/
  connection.onInitialize((params: InitializeParams) => {
    const clientCapabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    // hasConfigurationCapability = !!(
    //   capabilities.workspace && !!capabilities.workspace.configuration
    // );
    hasWorkspaceFolderCapability = !!(
      clientCapabilities.workspace &&
      !!clientCapabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      clientCapabilities.textDocument &&
      clientCapabilities.textDocument.publishDiagnostics &&
      clientCapabilities.textDocument.publishDiagnostics.relatedInformation
    );

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
    connection.console.log(
      `hasConfigurationCapability: ${hasConfigurationCapability}`,
    );
    connection.console.log(
      `hasWorkspaceFolderCapability: ${hasWorkspaceFolderCapability}`,
    );

    // NOTE: Currently, we disable configuration capability for server
    // if (hasConfigurationCapability) {
    //   // Register for all configuration changes.
    //   connection.client.register(
    //     DidChangeConfigurationNotification.type,
    //     undefined,
    //   );
    // }
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders((_event) => {
        connection.console.log('Workspace folder change event received.');
      });
    }
  });

  connection.onRequest(
    'textDocument/setBasePath',
    (params: { basePath: string }) => {
      basePath = params.basePath;
    },
  );

  /**************************** SEMANTIC TOKENS ******************************/
  /**
   * NOTE: For full semantic tokens request, we can only directly listen the
   * request instead of `connection.languages.semanticTokens.on()`.
   * Reference: https://github.com/microsoft/vscode-discussions/discussions/819
   */
  connection.onRequest(
    'textDocument/semanticTokens/full',
    (params: SemanticTokensParams): SemanticTokens => {
      const result = makeSemanticTokensFullResponse(
        params,
        documents.get(params.textDocument.uri),
      );
      // console.log(`semanticTokens: data: ${result.data}`);
      return result;
    },
  );

  /*************************** USER CONFIGURATION ****************************/
  /**
   * The example settings.
   *
   * NOTE: Currently not used.
   */
  interface ExampleSettings {
    maxNumberOfProblems: number;
  }

  // The global settings, used when the `workspace/configuration` request is
  // not supported by the client. Please note that this is not the case when
  // using this server with the client provided in this example but could
  // happen with other clients.
  const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
  let globalSettings: ExampleSettings = defaultSettings;

  /**
   * Cache the settings of all open documents
   */
  const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

  connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
      // Reset all cached document settings
      documentSettings.clear();
    } else {
      globalSettings = <ExampleSettings>(
        (change.settings.languageServerExample || defaultSettings)
      );
      connection.console.log(
        `onDidChangeConfiguration: globalSettings: ${globalSettings}`,
      );
    }

    // Revalidate all open text documents
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
  });

  /******************************** VALIDATE *********************************/
  // The content of a text document has changed. This event is emitted
  // when the text document first opened or when its content has changed.
  documents.onDidChangeContent(async (change) => {
    // TODO: Errors (e.g., variable undefined) & linting (e.g., ending`;`)
    // await validateTextDocument(change.document);
  });

  async function validateTextDocument(
    textDocument: TextDocument,
  ): Promise<void> {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);
    connection.console.log(JSON.stringify(settings));

    const diagnostics: Diagnostic[] = [];

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }

  /******************************* COMPLETION ********************************/
  documents.onDidChangeContent(async (params) => {
    connection.console.log('TextDocument didChange');
    checkTriggerCompletion(params, () => {
      console.debug('Sending completion request to client...');
      connection.sendRequest('textDocument/completion');
    });
  });

  connection.onCompletion(
    async (params: CompletionParams): Promise<CompletionItem[]> => {
      const document = documents.get(params.textDocument.uri);
      return await complete(params, document, basePath);
    },
  );

  // This handler resolves additional information for the item selected in
  // the completion list.
  connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    return item;
  });

  /********************************* LISTEN **********************************/
  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();
}
