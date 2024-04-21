import {
  createConnection,
  TextDocuments,
  Diagnostic,
  InitializeParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  MessageReader,
  MessageWriter,
  SemanticTokensParams,
  SemanticTokensRangeParams,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { getCommands } from './suggestionRules/getCommands';
import { getArgsKey } from './suggestionRules/getArgsKey';
import { getKeywordsAndConstants } from './suggestionRules/getKeywordsAndConstants';

export function createWsConnection(
  reader: MessageReader,
  writer: MessageWriter,
) {
  // Create a connection for the server, using Node's IPC as a transport.
  // Also include all preview / proposed LSP features.
  const connection = createConnection(reader, writer);
  // Create a simple text document manager.
  const documents: TextDocuments<TextDocument> = new TextDocuments(
    TextDocument,
  );

  const hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;
  let hasDiagnosticRelatedInformationCapability = false;

  connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    // hasConfigurationCapability = !!(
    //   capabilities.workspace && !!capabilities.workspace.configuration
    // );
    hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
        },
        semanticTokensProvider: {
          full: false,
          range: true,
          documentSelector: null,
          legend: {
            tokenTypes: ['function', 'parameter'],
            tokenModifiers: [],
          },
        },
      },
    };
    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };
    }
    return result;
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

  // The example settings
  interface ExampleSettings {
    maxNumberOfProblems: number;
  }

  // The global settings, used when the `workspace/configuration` request is not supported by the client.
  // Please note that this is not the case when using this server with the client provided in this example
  // but could happen with other clients.
  const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
  let globalSettings: ExampleSettings = defaultSettings;

  // Cache the settings of all open documents
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
        `connection.onDidChangeConfiguration: globalSettings: ${globalSettings}`,
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

  // Only keep settings for open documents
  documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
  });

  // The content of a text document has changed. This event is emitted
  // when the text document first opened or when its content has changed.
  documents.onDidChangeContent(async (change) => {
    await validateTextDocument(change.document);
  });

  async function validateTextDocument(
    textDocument: TextDocument,
  ): Promise<void> {
    // In this simple example we get the settings for every validate run.
    const settings = await getDocumentSettings(textDocument.uri);

    // The validator creates diagnostics for all uppercase words length 2 and more
    const text = textDocument.getText();
    const pattern = /\b[A-Z]{2,}\b/g;
    let m: RegExpExecArray | null;

    connection.console.log(settings.toString());

    const problems = 0;
    const diagnostics: Diagnostic[] = [];

    // while (
    //   (m = pattern.exec(text)) &&
    //   problems < settings.maxNumberOfProblems
    // ) {
    //   problems++;
    //   let diagnostic: Diagnostic = {
    //     severity: DiagnosticSeverity.Warning,
    //     range: {
    //       start: textDocument.positionAt(m.index),
    //       end: textDocument.positionAt(m.index + m[0].length),
    //     },
    //     message: `${m[0]} is all uppercase.`,
    //     source: 'ex',
    //   };
    //   if (hasDiagnosticRelatedInformationCapability) {
    //     diagnostic.relatedInformation = [
    //       {
    //         location: {
    //           uri: textDocument.uri,
    //           range: Object.assign({}, diagnostic.range),
    //         },
    //         message: 'Spelling matters',
    //       },
    //       {
    //         location: {
    //           uri: textDocument.uri,
    //           range: Object.assign({}, diagnostic.range),
    //         },
    //         message: 'Particularly for names',
    //       },
    //     ];
    //   }
    //   diagnostics.push(diagnostic);
    // }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }

  connection.languages.semanticTokens.onRange(
    (p: SemanticTokensRangeParams) => {
      const document = documents.get(p.textDocument.uri);
      const line = document.getText({
        start: p.range.start,
        end: p.range.end,
      });
      connection.console.log(`onCompletion: line: ${line}`);
      return {
        data: [0, 5, 4, 1, 0],
      };
    },
  );

  connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VS Code
    connection.console.log('We received a file change event');
  });

  // This handler provides the initial list of the completion items.
  connection.onCompletion((p: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    const document = documents.get(p.textDocument.uri);
    const position = p.position;
    const line = document.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    const allTextBefore = document.getText({
      start: { line: 0, character: 0 },
      end: position,
    });
    connection.console.log(`onCompletion: line: ${line}`);

    const suggestions: CompletionItem[] = [];
    suggestions.push(...getCommands(line, allTextBefore, position));
    suggestions.push(...getArgsKey(line, allTextBefore, position));
    suggestions.push(...getKeywordsAndConstants(line, allTextBefore, position));
    connection.console.log(`onCompletion: suggestions: ${suggestions}`);

    return suggestions;
  });

  // This handler resolves additional information for the item selected in
  // the completion list.
  connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    // if (item.data === 1) {
    //   item.detail = 'TypeScript details';
    //   item.documentation = 'TypeScript documentation';
    // } else if (item.data === 2) {
    //   item.detail = 'JavaScript details';
    //   item.documentation = 'JavaScript documentation';
    // }
    return item;
  });

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();
}
