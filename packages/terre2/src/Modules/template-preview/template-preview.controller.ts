import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  StreamableFile,
} from '@nestjs/common';
import { TemplatePreviewService } from './template-preview.service';

@Controller('template-preview')
export class TemplatePreviewController {
  constructor(
    private readonly templatePreviewService: TemplatePreviewService,
  ) {}

  @Get('/:templateName/game/template/:path(*)')
  getTemplateAsset(
    @Param('path') path: string,
    @Param('templateName') templateName: string,
    @Req() req: Request,
  ) {
    const url = req.url;
    const templateFilePath = url.split('/template/')?.[1] ?? '';
    const targetPath = `${templateName}/${templateFilePath}`;
    const readResult =
      this.templatePreviewService.getTemplateFileByPath(targetPath);
    if (readResult) {
      return new StreamableFile(readResult);
    } else {
      throw new NotFoundException('The requested file does not exist.');
    }
  }
}
