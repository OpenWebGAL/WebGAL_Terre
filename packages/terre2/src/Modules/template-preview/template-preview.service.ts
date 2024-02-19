import { ConsoleLogger, Injectable } from '@nestjs/common';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as fsp from 'fs/promises';
import { createReadStream, ReadStream } from 'fs';

@Injectable()
export class TemplatePreviewService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 获取某个模板下的文件
   * @param path path 形如 templateName/UI/xxx.scss
   */
  getTemplateFileByPath(path: string): undefined | ReadStream {
    const targetPath = this.webgalFs.getPathFromRoot(
      `/public/templates/${path}`,
    );
    let result: ReadStream | undefined;
    try {
      result = createReadStream(targetPath);
    } catch (e) {
      result = undefined;
    }
    return result;
  }
}
