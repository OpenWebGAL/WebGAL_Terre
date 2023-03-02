import {
  CompletionItem,
  CompletionItemKind,
  Position,
} from 'vscode-languageserver';

export function getCommands(
  line: string,
  allTextBefore: string,
  position: Position,
): CompletionItem[] {
  if (!line.split('').includes(':')) return commandSuggestions;
  else return [];
}

const commandSuggestions: CompletionItem[] = [
  {
    label: 'changeBg',
    kind: CompletionItemKind.Function,
    documentation: '更新背景图片',
    detail: 'command changeBg:fileName :string;',
    insertText: 'changeBg:',
  },
];
