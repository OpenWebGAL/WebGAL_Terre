import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  TextDocumentChangeEvent,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  IScene,
  ISentence,
} from 'webgal-parser/build/types/interface/sceneInterface';
import { webgalParser } from '../../../util/webgal-parser';
import {
  handleAnimationFileSuggestions,
  handleFileSuggestions,
} from './fileSuggestion';
import { commandType } from './commandArgs';
import { getCommands } from '../suggestionRules/getCommands';
import { getArgsKey } from '../suggestionRules/getArgsKey';
import { findSentenceByLine, parseSentences } from '../sentenceLocator';

/**
 * 上一次同步后的文档行内容，用于找出刚发生变化的那一行。
 * 首次同步为 null，此时只建立基线、不触发补全。
 */
let lastDocumentLines: string[] | null = null;
const variableList: Map<string, number> = new Map<string, number>();

export function checkTriggerCompletion(
  params: TextDocumentChangeEvent<TextDocument>,
  triggerCompletionCallback: () => void,
) {
  const lines = readLines(params.document);
  refreshVariables(lines);

  const previous = lastDocumentLines;
  lastDocumentLines = lines;

  if (!previous) return;

  const changedLine = lines.findIndex((line, i) => line !== previous[i]);
  if (changedLine >= 0 && lines[changedLine].trimEnd().endsWith(':')) {
    triggerCompletionCallback();
  }
}

function readLines(document: TextDocument): string[] {
  return document.getText().split(/\r\n|\r|\n/);
}

function refreshVariables(lines: string[]): void {
  variableList.clear();
  variableList.set('Game_name', -1);
  variableList.set('Game_key', -1);
  variableList.set('Title_img', -1);
  variableList.set('Title_bgm', -1);
  variableList.set('Game_Logo', -1);

  lines.forEach((line, i) => {
    const variable = line.match('(?<=setVar:\\s*)\\w*');
    if (variable) {
      variableList.set(variable[0], i);
    }

    const userInput = line.match('(?<=getUserInput:\\s*)\\w*');
    if (userInput) {
      variableList.set(userInput[0], i);
    }
  });
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

/**
 * 取出光标所在的语句。
 *
 * 光标落在多行语句的续行上时，这一行单独看既没有命令也不成句，必须回到整条语句
 * 的解析结果，参数建议才会对应正确的命令。其余情况仍然只解析光标之前的这一段，
 * 这样对还没写完的语句（例如刚敲下 `changeFigure:`）也能给出建议。
 */
function resolveSentencesAtCursor(
  params: CompletionParams,
  document: TextDocument,
  linePrefix: string,
): ISentence[] {
  const sentence = findSentenceByLine(
    parseSentences(document.getText(), params.textDocument.uri),
    params.position.line,
  );

  if (sentence && sentence.startLine !== params.position.line) {
    return [sentence];
  }

  const scene: IScene = webgalParser.parse(
    linePrefix,
    'scene.txt',
    params.textDocument.uri,
  );
  return scene.sentenceList;
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

  let suggestions: CompletionItem[] = [];

  // FIXME: Known bug: `getUserInput` returns commandType 0 (say)
  // FIXME: Known bug: `setTransition` returns commandType 0 (say)
  const sentences = resolveSentencesAtCursor(params, document, line);

  // Currently, there SHOULD be only one sentence. But we still handle
  // potential modifications to the language specification.
  for (const sentence of sentences) {
    let newSuggestions: CompletionItem[] = [];

    if (line.includes(' -')) {
      if (line.match('\\s\\-(\\w*?)$')) {
        newSuggestions = getArgsKey(line, sentence.command);
      } else if (
        line.match('\\s\\-(enter|exit)=[^\\s;]*$') &&
        [
          commandType.changeBg,
          commandType.changeFigure,
          commandType.setTransition,
        ].includes(sentence.command)
      ) {
        newSuggestions = await handleAnimationFileSuggestions(basePath, line);
      }
    } else {
      switch (sentence.command) {
        case commandType.say: {
          break;
        }
        case commandType.changeBg: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.changeFigure: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.bgm: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.video: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.playEffect: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.miniAvatar: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.changeScene: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.callScene: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.unlockCg: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.unlockBgm: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
        case commandType.choose: {
          newSuggestions = await handleFileSuggestions(
            sentence,
            basePath,
            line,
          );
          break;
        }
      }
    }

    suggestions = suggestions.concat(newSuggestions);
  }

  return suggestions;
}
