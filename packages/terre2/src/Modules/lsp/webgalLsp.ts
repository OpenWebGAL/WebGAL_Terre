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
  SemanticTokenTypes,
  SemanticTokenModifiers,
  CompletionParams,
  CompletionTriggerKind,
  DidChangeTextDocumentParams,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { getCommands } from './suggestionRules/getCommands';
import { getArgsKey } from './suggestionRules/getArgsKey';
import { getKeywordsAndConstants } from './suggestionRules/getKeywordsAndConstants';
import { webgalParser } from '../../util/webgal-parser';
import { IScene } from 'webgal-parser/build/types/interface/sceneInterface';
import { pprintJSON } from 'src/util/strings';
import {
  commandArgs,
  commandType,
  makeCompletion,
  shouldInsertDash,
} from './completion/commandArgs';
import { handleFileSuggestions } from './completion/fileSuggestion';

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

    basePath = params.workspaceFolders[0].name;

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // Tell the client that this server supports code completion.
        completionProvider: {
          resolveProvider: true,
          triggerCharacters: ['-', ':'],
        },
        semanticTokensProvider: {
          full: true,
          range: false,
          documentSelector: null,
          legend: {
            tokenTypes: Object.values(SemanticTokenTypes),
            tokenModifiers: Object.values(SemanticTokenModifiers),
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

  connection.onDidCloseTextDocument((params) => {
    documentSettings.delete(params.textDocument.uri);
  });

  // The content of a text document has changed. This event is emitted
  // when the text document first opened or when its content has changed.
  // documents.onDidChangeContent(async (change) => {
  //   await validateTextDocument(change.document);
  // });

  /**
   * Cache the last document lines
   */
  let lastDocumentLines = [];

  documents.onDidChangeContent(async (params) => {
    connection.console.log('TextDocument didChange');
    console.debug(params);
    let currentDocumentLines: string[] = [];
    let changedLine = -1;
    for (let i = 0; i < params.document.lineCount; i++) {
      const line = params.document
        .getText({
          start: { line: i, character: 0 },
          end: { line: i + 1, character: 0 },
        })
        .replace('\n', '');

      currentDocumentLines[i] = line;

      if (lastDocumentLines && lastDocumentLines[i] !== line) {
        lastDocumentLines[i] = line;
        changedLine = i;
      }
    }
    if (!lastDocumentLines) {
      lastDocumentLines = currentDocumentLines;
    }

    if (changedLine > 0) {
      const line = currentDocumentLines[changedLine];
      if (line.endsWith(':')) {
        console.debug('Sending completion request to client...');
        connection.sendRequest('textDocument/completion');
      }
    }
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

  connection.onCompletion(
    async (params: CompletionParams): Promise<CompletionItem[]> => {
      const document = documents.get(params.textDocument.uri);
      const position = params.position;
      const line = document.getText({
        start: { line: position.line, character: 0 },
        end: position,
      });

      // Before receving `:`, consider waiting for a new command
      // NOTE: this may not be the case if the same character is saying, but we
      // don't have other ways to distinguish these two cases
      if (!line.includes(':')) {
        return getCommands(line);
      }

      // If cursor after comment region, disable completion
      if (line.includes(';') && position.character > line.indexOf(';')) {
        return [];
      }

      return await complete(line, params);
    },
  );

  async function complete(line: string, params: CompletionParams) {
    /**
     * Ver 1 (manual parsing)
     */
    // suggestions.push(...getCommands(line, allTextBefore, position));
    // suggestions.push(...getArgsKey(line, allTextBefore, position));
    // suggestions.push(...getKeywordsAndConstants(line, allTextBefore, position));

    /**
     * Ver 2 (using webgal-parser)
     */
    console.debug(`Line to complete: ${line}`);

    let suggestions: CompletionItem[] = [];

    // FIXME: Known bug: `getUserInput` returns commandType 0 (say)
    // FIXME: Known bug: `setTransition` returns commandType 0 (say)
    const scene: IScene = webgalParser.parse(
      line,
      'scene.txt',
      params.textDocument.uri,
    );

    // Currently, there SHOULD be only one sentence. But we still handle
    // potential modifications to the language specification.
    for (const sentence of scene.sentenceList) {
      console.debug(`Sentence: ${pprintJSON(sentence, true)}`);

      let newSuggestions;

      if (line.charAt(params.position.character - 1) === ':') {
        if (sentence.command === commandType.say) {
          newSuggestions = [];
        } else {
          // Encountering file name input. Do file suggestions.
          newSuggestions = await handleFileSuggestions(sentence, basePath);
        }
      } else {
        // No file suggestions. Check completion.
        newSuggestions = makeCompletion(
          commandArgs[sentence.command],
          shouldInsertDash(line, params),
        );
      }

      suggestions = suggestions.concat(newSuggestions);
    }

    console.log(`onCompletion: suggestions: ${pprintJSON(suggestions, true)}`);

    return suggestions;
  }

  // This handler resolves additional information for the item selected in
  // the completion list.
  connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    return item;
  });

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();
}
