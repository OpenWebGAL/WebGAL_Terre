import { Injectable } from '@nestjs/common';
import {
  CompletionParams,
  CompletionList,
  TextDocument,
  CompletionItem,
  CompletionItemKind,
} from 'vscode-languageserver';

@Injectable()
export class LspService {
  private documents = new Map<string, TextDocument>();

  async updateDocument(uri: string, newValue: string) {
    this.documents.set(uri, TextDocument.create(uri, 'webgal', 4, newValue));
  }

  async completion(params: CompletionParams): Promise<CompletionList> {
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    const line = document.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    // if (!line.includes('changeBg')) {
    //   return null;
    // }

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

    return { isIncomplete: false, items: suggestions };
  }
}
