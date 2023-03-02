import { Body, Controller, Post } from '@nestjs/common';
import { CompletionList, CompletionParams } from 'vscode-languageserver';
import { LspService } from './lsp.service';

@Controller('api/lsp')
export class LspController {
  constructor(private readonly myLanguageService: LspService) {}

  @Post('compile')
  async compile(
    @Body() data: { editorValue: string; params: CompletionParams },
  ): Promise<CompletionList> {
    await this.myLanguageService.updateDocument(
      data.params.textDocument.uri,
      data.editorValue,
    );
    return this.myLanguageService.completion(data.params);
  }

  @Post('updateDocument')
  async update(@Body('uri') uri: string, @Body('newValue') newValue: string) {
    await this.myLanguageService.updateDocument(uri, newValue);
    return 'OK';
  }
}
