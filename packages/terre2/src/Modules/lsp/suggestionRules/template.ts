import { CompletionItem, Position } from 'vscode-languageserver';

export function getTemplate(
  line: string,
  allTextBefore: string,
  position: Position,
): CompletionItem[] {
  return [];
}
