import {
  CompletionItem,
  CompletionItemKind,
  Position,
} from 'vscode-languageserver';

export function getKeywordsAndConstants(
  line: string,
  allTextBefore: string,
  position: Position,
): CompletionItem[] {
  if (line.endsWith('setTextbox:')) {
    return constants;
  } else if (line.endsWith(':')) {
    return keyWords;
  }
  return [];
}

const keyWords: CompletionItem[] = [
  {
    label: 'none',
    kind: CompletionItemKind.Keyword,
    documentation: `空值`,
    detail: `keyword none`,
    insertText: 'none',
  },
];

const constants: CompletionItem[] = [
  {
    label: 'hide',
    kind: CompletionItemKind.Constant,
    documentation: `隐藏文本框`,
    detail: `constant hide`,
    insertText: 'hide;',
  },
];
