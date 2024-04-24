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
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { getCommands } from './suggestionRules/getCommands';
import { getArgsKey } from './suggestionRules/getArgsKey';
import { getKeywordsAndConstants } from './suggestionRules/getKeywordsAndConstants';
import { webgalParser } from '../../util/webgal-parser';
import { IScene } from 'webgal-parser/build/types/interface/sceneInterface';
import { pprintJSON } from 'src/util/strings';
import { commandArgs, makeCompletion } from './commandArgs';

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
          triggerCharacters: ['-'],
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

  connection.onDidChangeWatchedFiles((_change) => {
    // Monitored files have change in VS Code
    connection.console.log('We received a file change event');
  });

  // This handler provides the initial list of the completion items.
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
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
    return complete(line, params);
  });

  function isTriggeringByDash(params: CompletionParams) {
    return (
      params.context.triggerKind === CompletionTriggerKind.TriggerCharacter &&
      params.context.triggerCharacter === '-'
    );
  }

  function doesNotContainDash(lineBefore: string) {
    const asciiRemoved = lineBefore.replace(/[^\x00-\x7F]/g, '');
    return asciiRemoved.lastIndexOf('-') === asciiRemoved.length - 1;
  }

  function complete(line: string, params: CompletionParams) {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    // const allTextBefore = document.getText({
    //   start: { line: 0, character: 0 },
    //   end: position,
    // });
    // connection.console.log(`onCompletion: line: ${line}`);

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

    if (line.trim().length === 0) {
      return getCommands(line);
    }

    let suggestions: CompletionItem[] = [];

    // FIXME: Known bug: `getUserInput` returns commandType 0 (say)
    // FIXME: Known bug: `setTransition` returns commandType 0 (say)
    const scene: IScene = webgalParser.parse(
      line,
      'scene.txt',
      params.textDocument.uri,
    );

    for (const sentence of scene.sentenceList) {
      console.debug(`Sentence: ${pprintJSON(sentence, true)}`);

      suggestions = suggestions.concat(
        makeCompletion(
          commandArgs[sentence.command],
          !isTriggeringByDash(params) &&
            doesNotContainDash(line.substring(0, params.position.character)),
        ),
      );
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
