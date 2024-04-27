import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  TextDocumentChangeEvent,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { IScene } from 'webgal-parser/build/types/interface/sceneInterface';
import { pprintJSON } from '../../../util/strings';
import { webgalParser } from '../../../util/webgal-parser';
import { handleFileSuggestions } from './fileSuggestion';
import {
  commandArgs,
  commandType,
  makeCompletion,
  shouldInsertDash,
} from './commandArgs';
import { lastVariables } from '../webgalLsp';
import { getCommands } from '../suggestionRules/getCommands';

/**
 * Cache the last document lines
 */
let lastDocumentLines = [];

export function checkTriggerCompletion(
  params: TextDocumentChangeEvent<TextDocument>,
  triggerCompletionCallback: () => void,
) {
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
    console.debug(`changed line: ${line}`);
    if (line.trimEnd().endsWith(':')) {
      triggerCompletionCallback();
    }
  }
}

export async function complete(
  params: CompletionParams,
  document: TextDocument,
  basePath: string,
) {
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

    let newSuggestions: CompletionItem[] = [];

    if (line.charAt(params.position.character - 1) === ':') {
      if (sentence.command === commandType.say) {
        // No suggestions for conversation
        newSuggestions = [];
      } else {
        // Encountering file name input. Do file suggestions
        newSuggestions = await handleFileSuggestions(sentence, basePath);
      }
    } else if (line.charAt(params.position.character - 1) === '{') {
      newSuggestions = [];

      if (sentence.command === commandType.say) {
        // Suggest variables
        lastVariables.forEach((v, k) => {
          if (v <= params.position.line) {
            newSuggestions.push({
              label: k,
              insertText: k + '}',
              kind: CompletionItemKind.Variable,
            });
          }
        });
      }
    } else {
      // No file suggestions. Check completion
      newSuggestions = makeCompletion(
        commandArgs[sentence.command],
        shouldInsertDash(line, params),
      );
    }

    suggestions = suggestions.concat(newSuggestions);
  }

  console.debug(`onCompletion: suggestions: ${pprintJSON(suggestions, true)}`);

  return suggestions;
}
