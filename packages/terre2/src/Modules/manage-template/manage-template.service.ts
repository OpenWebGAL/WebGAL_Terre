import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as fsp from 'fs/promises';
import { webgalParser } from '../../util/webgal-parser';

@Injectable()
export class ManageTemplateService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 创建模板
   * @param templateName 模板名称
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

    /**
     * 把模板配置文件的名称改一下
     */
    const templateConfig = {
      name: templateName,
      'webgal-version': '4.5.4',
    };

    const templateConfigText = JSON.stringify(templateConfig, undefined, 2);

    // 写一下文件系统
    await this.webgalFs.updateTextFile(
      this.webgalFs.getPathFromRoot(
        `/public/templates/${templateName}/template.json`,
      ),
      templateConfigText,
    );

    return true;
  }

  /**
   * 删除模板
   * @param templateName 模板名称
   */
  async deleteTemplate(templateName: string): Promise<boolean> {
    const templatePath = this.webgalFs.getPathFromRoot(
      `/public/templates/${templateName}`,
    );
    return this.webgalFs.deleteFileOrDirectory(templatePath);
  }

  /**
   * 应用模板到游戏
   * @param templateName 模板名称
   * @param gameName 游戏名称
   */
  async applyTemplateToGame(
    templateName: string,
    gameName: string,
  ): Promise<boolean> {
    try {
      // 删除指定游戏的模板
      await this.webgalFs.deleteFileOrDirectory(
        this.webgalFs.getPathFromRoot(`public/games/${gameName}/game/template`),
      );

      // 递归复制指定的模板到游戏
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(`/public/templates/${templateName}/`),
        this.webgalFs.getPathFromRoot(
          `public/games/${gameName}/game/template/`,
        ),
      );

      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  /**
   * 获取某个模板文件下的类
   * @param path path 形如 templateName/UI/xxx.scss
   * @param className 某个类
   */
  async getStyleByClass(path: string, className: string): Promise<string> {
    const targetPath = this.webgalFs.getPathFromRoot(`/public/${path}`);
    const file = await fsp.readFile(targetPath);
    const str = file.toString();
    const classes = webgalParser.parseScssToWebgalStyleObj(str);
    const classNameStyle = classes.classNameStyles?.[className];
    if (!className) {
      throw new NotFoundException();
    }
    return classNameStyle as string;
  }
}
