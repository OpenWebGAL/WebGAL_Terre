import {
  SemanticTokensBuilder,
  SemanticTokensParams,
  uinteger,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { lastVariables } from './lastVariables';
import { parseSentences } from './sentenceLocator';
import { collectSentenceTokens, IParsedToken } from './sentenceTokens';

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

/**
 * 整篇文档一次性解析，再逐条语句取 token。
 *
 * 这里不能逐行解析：多行语句的参数写在续行上，单独看那一行既拿不到命令，
 * 也拿不到参数，着色会断在续行处。
 */
function parseSemanticTokens(text: string, uri: string): IParsedToken[] {
  const lines = text.split(/\r\n|\r|\n/);

  lastVariables.clear();

  return parseSentences(text, uri).flatMap((sentence) =>
    collectSentenceTokens(sentence, lines),
  );
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
