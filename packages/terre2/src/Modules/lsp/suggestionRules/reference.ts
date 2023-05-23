import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

const suggestions: CompletionItem[] = [
  {
    label: 'bg.png',
    kind: CompletionItemKind.File,
    detail: 'Change background image.',
  },
  {
    label: 'id',
    kind: CompletionItemKind.Constant,
    detail: 'The ID of the image.',
    insertText: 'id=',
  },
  {
    label: 'true',
    kind: CompletionItemKind.Constant,
    detail: 'The value is true.',
    insertText: '${1:true}',
  },
  {
    label: 'false',
    kind: CompletionItemKind.Constant,
    detail: 'The value is false.',
    insertText: '${1:false}',
  },
  {
    label: 'number',
    kind: CompletionItemKind.Class,
    detail: 'The value is a number.',
    insertText: '${1:number}',
  },
  {
    label: 'string',
    kind: CompletionItemKind.Class,
    detail: 'The value is a string.',
    insertText: '${1:string}',
  },
];
