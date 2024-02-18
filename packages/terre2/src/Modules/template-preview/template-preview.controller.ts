import {
  ConsoleLogger,
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { TemplatePreviewService } from './template-preview.service';

@Controller('template-preview')
export class TemplatePreviewController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly templatePreviewService: TemplatePreviewService,
  ) {}

  @Get('/:templateName/game/template/:path(*)')
  getTemplateAsset(
    @Param('path') path: string,
    @Param('templateName') templateName: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const url = req.url;

    const templateFilePath = url.split('/template/')?.[1] ?? '';
    const targetPath = `${templateName}/${templateFilePath}`;
    const readResult =
      this.templatePreviewService.getTemplateFileByPath(targetPath);
    if (readResult) {
      // 如果文件存在，可以直接使用 res.sendFile(filePath) 来发送文件
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      readResult.pipe(res);
    } else {
      // 如果文件不存在，你可以尝试手动触发 ServeStaticModule 的逻辑，但这在 NestJS 中不是直接支持的行为
      // 一个可能的解决方案是抛出一个 NotFoundException，让 NestJS 继续寻找下一个匹配的路由/处理器
      // 注意：这里抛出的异常会被全局异常过滤器捕获，可能不会直接触发 ServeStaticModule
      throw new NotFoundException('The requested file does not exist.');
    }
  }
}
