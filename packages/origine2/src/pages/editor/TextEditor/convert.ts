import * as monaco from 'monaco-editor';
import { CompletionItemKind } from 'vscode-languageserver';

export function mapLspKindToMonacoKind(lspKind: CompletionItemKind): monaco.languages.CompletionItemKind {
  switch (lspKind) {
  case CompletionItemKind.Text:
    return monaco.languages.CompletionItemKind.Text;

  case CompletionItemKind.Method:
  case CompletionItemKind.Function:
    return monaco.languages.CompletionItemKind.Method;

  case CompletionItemKind.Constructor:
    return monaco.languages.CompletionItemKind.Constructor;

  case CompletionItemKind.Field:
  case CompletionItemKind.Variable:
    return monaco.languages.CompletionItemKind.Variable;

  case CompletionItemKind.Class:
    return monaco.languages.CompletionItemKind.Class;

  case CompletionItemKind.Interface:
    return monaco.languages.CompletionItemKind.Interface;

  case CompletionItemKind.Module:
    return monaco.languages.CompletionItemKind.Module;

  case CompletionItemKind.Property:
    return monaco.languages.CompletionItemKind.Property;

  case CompletionItemKind.Unit:
  case CompletionItemKind.Value:
    return monaco.languages.CompletionItemKind.Value;

  case CompletionItemKind.Enum:
    return monaco.languages.CompletionItemKind.Enum;

  case CompletionItemKind.Keyword:
    return monaco.languages.CompletionItemKind.Keyword;

  default:
    return monaco.languages.CompletionItemKind.Text;
  }
}
