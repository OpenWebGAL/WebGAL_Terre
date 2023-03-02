import { ConsoleLogger, Injectable } from '@nestjs/common';
import {
  CompletionParams,
  CompletionList,
  TextDocument,
  CompletionItem,
  TextDocuments,
} from 'vscode-languageserver';
import { getCommands } from './suggestionRules/getCommands';

@Injectable()
export class LspService {
  constructor(private readonly logger: ConsoleLogger) {}

  // private documents = new Map<string, TextDocument>();

  // async updateDocument(uri: string, newValue: string) {
  //   this.documents.set(uri, TextDocument.create(uri, 'webgal', 4, newValue));
  // }

  async completion(
    params: CompletionParams,
    value: string,
  ): Promise<CompletionList> {
    const document = TextDocument.create(
      params.textDocument.uri,
      'webgal',
      4,
      value,
    );
    const position = params.position;
    const line = document.getText({
      start: { line: position.line, character: 0 },
      end: position,
    });
    const allTextBefore = document.getText({
      start: { line: 0, character: 0 },
      end: position,
    });

    this.logger.log('GET SUGGESTION FOR ' + line);
    /**
     * 初始化
     */
    const suggestions: CompletionItem[] = [];

    // 指令
    suggestions.push(...getCommands(line, allTextBefore, position));

    return { isIncomplete: false, items: suggestions };
  }
}
