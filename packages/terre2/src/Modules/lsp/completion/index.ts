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
  commandType,
} from './commandArgs';
import { lastVariables } from '../webgalLsp';
import { getCommands } from '../suggestionRules/getCommands';
import { getArgsKey } from '../suggestionRules/getArgsKey';

/**
 * Cache the last document lines
 */
let lastDocumentLines = [];
let variableList: Map<string, number> = new Map<string, number>();

export function checkTriggerCompletion(
  params: TextDocumentChangeEvent<TextDocument>,
  triggerCompletionCallback: () => void,
) {
  const currentDocumentLines: string[] = [];
  let changedLine = -1;

  variableList.clear();
  variableList.set('Game_name', -1);
  variableList.set('Game_key', -1);
  variableList.set('Title_img', -1);
  variableList.set('Title_bgm', -1);
  variableList.set('Game_Logo', -1);

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

    const variable = line.match('(?<=setVar:\\s*)\\w*');
    if (variable) {
      variableList.set(variable[0], i);
    }

    const userInput = line.match('(?<=getUserInput:\\s*)\\w*');
    if (userInput) {
      variableList.set(userInput[0], i);
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

function suggestVariables(params: CompletionParams) {
  const result = [];

  variableList.forEach((v, k) => {
    if (v <= params.position.line) {
      result.push({
        label: k,
        insertText: k,
        kind: CompletionItemKind.Variable,
      });
    }
  });

  return result;
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
  
  // If cursor after comment region, disable completion
  if (line.includes(';') && position.character > line.indexOf(';')) {
    return [];
  }

  if (line.endsWith('{')) {
    return suggestVariables(params);
  }

  // If there's no ':' and cursor position is at the start of line
  // consider waiting for a new command
  if (line.match('^\\w*$')) {
    return getCommands();
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

    if (line.includes(' -')) {
      if (line.match('\\s\\-(\\w*?)$')) {
        newSuggestions = getArgsKey(line, sentence.command);
      }
    } else {
      switch (sentence.command) {
        case (commandType.say): {
          break;
        }
        case (commandType.changeBg): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.changeFigure): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.bgm): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.video): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.playEffect): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.miniAvatar): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.changeScene): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.callScene): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.unlockCg): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.unlockBgm): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
        case (commandType.choose): {
          newSuggestions = await handleFileSuggestions(sentence, basePath, line);
          break;
        }
      }
    }

    suggestions = suggestions.concat(newSuggestions);
  }

  console.debug(`onCompletion: suggestions: ${pprintJSON(suggestions, true)}`);

  return suggestions;
}
