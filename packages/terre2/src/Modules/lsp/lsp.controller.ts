import { Body, Controller, Post } from '@nestjs/common';
import { CompletionList, CompletionParams } from 'vscode-languageserver';
import { LspService } from './lsp.service';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

class CompletionDto {
  @ApiProperty({
    description: 'Editor input value for which the completion is required',
  })
  editorValue: string;

  @ApiProperty({ description: 'Parameters required for completion' })
  params: CompletionParams;
}

@Controller('api/lsp')
@ApiTags('LSP')
export class LspController {
  constructor(private readonly myLanguageService: LspService) {}

  @Post('compile')
  @ApiOperation({ summary: 'Get code completions based on given input' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the completion list.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch the completion list.',
  })
  async compile(@Body() data: CompletionDto): Promise<CompletionList> {
    return this.myLanguageService.completion(data.params, data.editorValue);
  }
}
