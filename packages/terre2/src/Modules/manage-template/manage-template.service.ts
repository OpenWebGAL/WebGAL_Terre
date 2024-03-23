import { ConsoleLogger, Injectable } from '@nestjs/common';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Injectable()
export class ManageTemplateService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 从模板创建游戏
   * @param templateName
   */
  async createTemplate(templateName: string): Promise<boolean> {
    // 检查是否存在这个模板
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/templates`),
    );
    let isThisTemplateExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === templateName && info.isDir) {
        isThisTemplateExist = true;
      }
    });
    if (isThisTemplateExist) {
      return false;
    }
    // 创建文件夹
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot('/public/templates'),
      templateName,
    );
    // 递归复制
    await this.webgalFs.copy(
      this.webgalFs.getPathFromRoot(
        '/assets/templates/WebGAL_Default_Template/',
      ),
      this.webgalFs.getPathFromRoot(`/public/templates/${templateName}/`),
    );
    return true;
  }
}
