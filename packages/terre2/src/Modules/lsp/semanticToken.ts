import { IScene } from 'webgal-parser/build/types/interface/sceneInterface';
import { webgalParser } from '../../util/webgal-parser';
import {
  SemanticTokensBuilder,
  SemanticTokensParams,
  uinteger,
} from 'vscode-languageserver';
import { commandType } from './completion/commandArgs';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { lastVariables } from './webgalLsp';

const TOKEN_TYPES = ['variable', 'keyword', 'value', 'string'];

export const tokenTypeMap = new Map<string, number>();
export const tokenModifierMap = new Map<string, number>();

for (const [index, element] of TOKEN_TYPES.entries()) {
  tokenTypeMap.set(element, index);
}

tokenModifierMap.set('default', 0);

export function makeSemanticTokensFullResponse(
  params: SemanticTokensParams,
  document: TextDocument,
) {
  return buildSemanticTokens(
    parseSemanticTokens(document.getText(), params.textDocument.uri),
  );
}

function buildSemanticTokens(tokens: IParsedToken[]) {
  const builder = new SemanticTokensBuilder();
  tokens.forEach((token) => {
    builder.push(
      token.line,
      token.startCharacter,
      token.length,
      encodeTokenType(token.tokenType),
      encodeTokenModifiers(token.tokenModifiers),
    );
  });
  return builder.build();
}

interface IParsedToken {
  line: number;
  startCharacter: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
}

function consumeArg(
  arg: {
    key: string;
    value: string | number | boolean;
  },
  line: string,
  lineNumber: number,
  currentOffset,
): [IParsedToken[], number] {
  if (arg.key === 'speaker') {
    return [[], currentOffset];
  }

  const tokens: IParsedToken[] = [];

  console.log(arg);

  if (arg.key.toString() !== '') {
    const argKeyOffset = line.indexOf(arg.key, currentOffset);
    if (argKeyOffset !== -1 && argKeyOffset >= currentOffset) {
      tokens.push({
        line: lineNumber,
        startCharacter: argKeyOffset,
        length: arg.key.length,
        tokenType: 'parameter',
        tokenModifiers: [],
      });
      console.log(`[line ${lineNumber}] key: ${arg.key}: ${argKeyOffset}`);
      currentOffset = argKeyOffset + arg.key.length;
    }
  }

  if (arg.value.toString() !== '') {
    const argValueOffset = line.indexOf(arg.value.toString(), currentOffset);
    if (argValueOffset !== -1 && argValueOffset >= currentOffset) {
      tokens.push({
        line: lineNumber,
        startCharacter: argValueOffset,
        length: arg.value.toString().length,
        tokenType: 'value',
        tokenModifiers: [],
      });
      console.log(
        `[line ${lineNumber}]value: ${arg.value.toString()}: ${argValueOffset}`,
      );
      currentOffset = argValueOffset + arg.value.toString().length;
    }
  }

  return [tokens, currentOffset];
}

function parseSemanticTokens(text: string, uri: string): IParsedToken[] {
  const r: IParsedToken[] = [];
  const lines = text.split(/\r\n|\r|\n/);

  lastVariables.clear();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const scene: IScene = webgalParser.parse(line, 'scene.txt', uri);
    const sentence = scene.sentenceList[0];

    let currentOffset = 0;

    // intro has special syntax
    if (sentence.command === commandType.intro) {
      const values = sentence.content.split(/\|/);
      console.debug(values);

      for (const value of values) {
        const valueOffset = line.indexOf(value, currentOffset);
        if (valueOffset === -1) {
          break;
        }

        r.push({
          line: i,
          startCharacter: valueOffset,
          length: value.length,
          tokenType: 'string',
          tokenModifiers: [],
        });
      }
    }

    // setVar has special syntax
    if (sentence.command === commandType.setVar) {
      if (sentence.content.match(/=/)) {
        const key = sentence.content.split(/=/)[0];
        const value = sentence.content.split(/=/)[1];

        // record variables (for completion)
        if (!lastVariables.has(key)) {
          lastVariables.set(key, i);
        }

        let newTokens: IParsedToken[];
        [newTokens, currentOffset] = consumeArg(
          { key, value },
          line,
          i,
          currentOffset,
        );

        newTokens.forEach((t) => r.push(t));
      }
    }

    // say has special syntax
    if (sentence.command === commandType.say) {
      do {
        const contentOffset = line.indexOf(sentence.content, currentOffset);
        if (contentOffset === -1) {
          break;
        }
        const openOffset = line.indexOf('{', contentOffset);
        if (openOffset === -1) {
          break;
        }
        const closeOffset = line.indexOf('}', openOffset);
        if (closeOffset === -1) {
          break;
        }

        r.push({
          line: i,
          startCharacter: openOffset,
          length: 1,
          tokenType: 'keyword',
          tokenModifiers: [],
        });

        r.push({
          line: i,
          startCharacter: openOffset + 1,
          length: closeOffset - openOffset - 1,
          tokenType: 'variable',
          tokenModifiers: [],
        });

        r.push({
          line: i,
          startCharacter: closeOffset,
          length: 1,
          tokenType: 'keyword',
          tokenModifiers: [],
        });

        currentOffset = closeOffset;
      } while (true);
    }

    currentOffset = 0;

    const args = sentence.args.sort(
      (a, b) => line.indexOf(a.key) - line.indexOf(b.key),
    );

    // other commands
    for (const arg of args) {
      let newTokens: IParsedToken[];
      [newTokens, currentOffset] = consumeArg(arg, line, i, currentOffset);

      newTokens.forEach((t) => r.push(t));
    }
  }
  return r;
}

function encodeTokenType(tokenType: string): uinteger {
  if (tokenTypeMap.has(tokenType)) {
    return tokenTypeMap.get(tokenType)!;
  }
  return 0;
}

function encodeTokenModifiers(strTokenModifiers: string[]): uinteger {
  let result = 0;
  for (let i = 0; i < strTokenModifiers.length; i++) {
    const tokenModifier = strTokenModifiers[i];
    if (tokenModifierMap.has(tokenModifier)) {
      result = result | (1 << tokenModifierMap.get(tokenModifier)!);
    }
  }
  return result;
}
