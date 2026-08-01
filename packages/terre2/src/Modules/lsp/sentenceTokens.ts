import { ISentence } from 'webgal-parser/build/types/interface/sceneInterface';
import { commandType } from './completion/commandArgs';
import { lastVariables } from './lastVariables';
import {
  flatIndexInSentence,
  SentenceCursor,
  TextPosition,
} from './sentenceLocator';

export interface IParsedToken {
  line: number;
  startCharacter: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
}

const token = (
  at: TextPosition,
  length: number,
  tokenType: string,
): IParsedToken => ({ ...at, length, tokenType, tokenModifiers: [] });

/**
 * 取出一条语句的全部语义 token。
 *
 * 语句可能跨多行，所有定位都通过游标在它的行范围内向后推进完成，
 * 因此续行里的参数同样能被正确着色。
 */
export function collectSentenceTokens(
  sentence: ISentence,
  lines: string[],
): IParsedToken[] {
  const tokens: IParsedToken[] = [];
  const cursor = new SentenceCursor(lines, sentence);

  if (sentence.command === commandType.intro) {
    tokens.push(...collectIntroTokens(sentence, cursor));
  }

  if (sentence.command === commandType.setVar) {
    tokens.push(...collectSetVarTokens(sentence, cursor));
  }

  if (sentence.command === commandType.say) {
    tokens.push(...collectInterpolationTokens(sentence, cursor));
  }

  cursor.rewind();
  tokens.push(...collectArgTokens(sentence, lines, cursor));

  return tokens;
}

/** intro 的内容由 `|` 分段，每段单独作为字符串着色 */
function collectIntroTokens(
  sentence: ISentence,
  cursor: SentenceCursor,
): IParsedToken[] {
  const tokens: IParsedToken[] = [];

  for (const segment of sentence.content.split(/(?<!\\)\|/)) {
    const at = cursor.find(segment);
    if (!at) {
      break;
    }
    tokens.push(token(at, segment.length, 'string'));
  }

  return tokens;
}

/** setVar 的内容是 `key=value`，并且要把变量名记下来供补全使用 */
function collectSetVarTokens(
  sentence: ISentence,
  cursor: SentenceCursor,
): IParsedToken[] {
  if (!sentence.content.includes('=')) {
    return [];
  }

  const [key, value] = sentence.content.split(/=/);
  if (!lastVariables.has(key)) {
    lastVariables.set(key, sentence.startLine);
  }

  return collectKeyValueTokens(key, value, cursor);
}

/** 对话里的 `{变量}` 插值 */
function collectInterpolationTokens(
  sentence: ISentence,
  cursor: SentenceCursor,
): IParsedToken[] {
  const tokens: IParsedToken[] = [];

  cursor.find(sentence.content);

  for (const match of sentence.content.matchAll(/(?<!\\)\{(.*?)\}/g)) {
    const open = cursor.find('{');
    const name = cursor.find(match[1]);
    const close = cursor.find('}');
    if (!open || !close) {
      break;
    }

    tokens.push(token(open, 1, 'keyword'));
    if (name) {
      tokens.push(token(name, match[1].length, 'variable'));
    }
    tokens.push(token(close, 1, 'keyword'));
  }

  return tokens;
}

/** 参数列表。speaker 由说话人语法隐含，不单独着色 */
function collectArgTokens(
  sentence: ISentence,
  lines: string[],
  cursor: SentenceCursor,
): IParsedToken[] {
  const argsInSourceOrder = [...sentence.args].sort(
    (a, b) =>
      flatIndexInSentence(lines, sentence, a.key) -
      flatIndexInSentence(lines, sentence, b.key),
  );

  return argsInSourceOrder
    .filter((arg) => arg.key !== 'speaker')
    .flatMap((arg) =>
      collectKeyValueTokens(arg.key, arg.value.toString(), cursor),
    );
}

function collectKeyValueTokens(
  key: string,
  value: string,
  cursor: SentenceCursor,
): IParsedToken[] {
  const tokens: IParsedToken[] = [];

  const keyAt = cursor.find(key);
  if (keyAt) {
    tokens.push(token(keyAt, key.length, 'parameter'));
  }

  const valueAt = cursor.find(value);
  if (valueAt) {
    tokens.push(token(valueAt, value.length, 'value'));
  }

  return tokens;
}
