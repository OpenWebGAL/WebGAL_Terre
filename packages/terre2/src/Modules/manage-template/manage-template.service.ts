import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as fsp from 'fs/promises';
import { webgalParser } from '../../util/webgal-parser';
import { version_number } from '../../main';
import { TemplateConfigDto, TemplateInfoDto } from './manage-template.dto';
import { randomUUID } from 'crypto';
import { _open } from '../../util/open';
import { dirname } from 'path';

@Injectable()
export class ManageTemplateService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 获取模板列表
   */
  async getTemplateList(): Promise<TemplateInfoDto[]> {
    // 如果模板文件夹不存在就创建
    if (!(await this.webgalFs.existsDir('public/templates')))
      await this.webgalFs.mkdir('public', 'templates');
    const path = this.webgalFs.getPathFromRoot(`public/templates`);
    const fileInfo = await this.webgalFs.getDirInfo(path);
    const templateList: Promise<TemplateInfoDto>[] = fileInfo
      .filter((file) => file.isDir)
      .map(async (item): Promise<TemplateInfoDto> => {
        try {
          const templateConfig: TemplateConfigDto =
            await this.getTemplateConfig(item.name);
          return {
            ...templateConfig,
            dir: item.name,
          };
        } catch {
          return null;
        }
      });
    return (await Promise.all(templateList)).filter((e) => e !== null);
  }

  /**
   * 创建模板
   * @param templateName 模板名称
   * @param templateDir 模板文件夹
   */
  async createTemplate(
    templateName: string,
    templateDir: string,
  ): Promise<boolean> {
    // 检查是否存在这个模板
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/templates`),
    );
    let isThisTemplateExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === templateDir && info.isDir) {
        isThisTemplateExist = true;
      }
    });
    if (isThisTemplateExist) {
      return false;
    }
    // 创建文件夹
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot('/public/templates'),
      templateDir,
    );
    // 递归复制
    await this.webgalFs.copy(
      this.webgalFs.getPathFromRoot(
        '/assets/templates/WebGAL_Default_Template/',
      ),
      this.webgalFs.getPathFromRoot(`/public/templates/${templateDir}/`),
    );

    /**
     * 把模板配置文件的名称改一下
     */
    const templateConfig: TemplateConfigDto = {
      name: templateName,
      id: randomUUID(),
      'webgal-version': version_number,
    };

    const templateConfigText = JSON.stringify(templateConfig, undefined, 2);

    // 写一下文件系统
    await this.webgalFs.updateTextFile(
      this.webgalFs.getPathFromRoot(
        `/public/templates/${templateDir}/template.json`,
      ),
      templateConfigText,
    );

    return true;
  }

  /**
   * 获取模板配置
   * @param templateDir 模板文件夹
   */
  async getTemplateConfig(templateDir: string): Promise<TemplateConfigDto> {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/templates/${decodeURI(templateDir)}/template.json`,
    );
    const templateConfigString = await this.webgalFs.readTextFile(
      configFilePath,
    );
    const templateConfig: TemplateConfigDto = JSON.parse(
      templateConfigString as string,
    );
    return templateConfig;
  }

  /**
   * 更新模板配置
   * @param templateDir 模板文件夹
   * @param newTemplateConfig 模板配置
   */
  async updateTemplateConfig(
    templateDir: string,
    newTemplateConfig: TemplateConfigDto,
  ): Promise<boolean> {
    const templateConfig = await this.getTemplateConfig(templateDir);

    if (!templateConfig) {
      return false;
    }

    const newConfig = { ...templateConfig, ...newTemplateConfig };

    const templateConfigText = JSON.stringify(newConfig, undefined, 2);

    await this.webgalFs.updateTextFile(
      this.webgalFs.getPathFromRoot(
        `/public/templates/${templateDir}/template.json`,
      ),
      templateConfigText,
    );

    return true;
  }

  /**
   * 删除模板
   * @param templateDir 模板名称
   */
  async deleteTemplate(templateDir: string): Promise<boolean> {
    const templatePath = this.webgalFs.getPathFromRoot(
      `/public/templates/${templateDir}`,
    );
    return this.webgalFs.deleteFileOrDirectory(templatePath);
  }

  /**
   * 应用模板到游戏
   * @param templateDir 模板文件夹
   * @param gameDir 游戏文件夹
   */
  async applyTemplateToGame(
    templateDir: string,
    gameDir: string,
  ): Promise<boolean> {
    try {
      // 删除指定游戏的模板
      await this.webgalFs.deleteFileOrDirectory(
        this.webgalFs.getPathFromRoot(`public/games/${gameDir}/game/template`),
      );

      // 递归复制指定的模板到游戏
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(`/public/templates/${templateDir}/`),
        this.webgalFs.getPathFromRoot(`public/games/${gameDir}/game/template/`),
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

    if (!(await this.webgalFs.exists(targetPath))) {
      await this.webgalFs.createEmptyFile(targetPath);
    }

    const file = await fsp.readFile(targetPath);
    const str = file.toString();
    const classes = webgalParser.parseScssToWebgalStyleObj(str);
    const classNameStyle = classes.classNameStyles?.[className];
    if (!className) {
      throw new NotFoundException();
    }
    return classNameStyle as string;
  }

  /**
   * 导出模板zip
   * @param sourceDir 源目录
   * @param outPath 输出目录
   */
  async outputTemplate(sourceDir: string, outPath: string): Promise<boolean> {
    // 检查是否存在这个模板
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/templates`),
    );
    let isThisTemplateExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === sourceDir && info.isDir) {
        isThisTemplateExist = true;
      }
    });
    if (!isThisTemplateExist) {
      return false;
    }

    const dis = this.webgalFs.getPathFromRoot(`/public/templates/${outPath}/`);

    const res = await this.webgalFs.compressedDirectory(
      this.webgalFs.getPathFromRoot(`/public/templates/${sourceDir}/`),
      dis,
      'zip',
    );

    _open(dirname(dis), { background: false });

    return res;
  }

  /**
   * 导入模板zip
   * @param sourceDir 源目录
   */
  async importTemplate(source: string | Buffer): Promise<boolean> {
    const metaRaw = this.webgalFs.readFileInZipToBuffer(
      source,
      'template.json',
    );
    if (!metaRaw) return false;

    let meta: TemplateConfigDto;
    try {
      meta = JSON.parse(metaRaw.toString()) as TemplateConfigDto;
    } catch (error) {
      this.logger.error('Failed to parse template.json from zip', error);
      return false;
    }

    // 检查是否存在这个模板
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/templates`),
    );

    let isThisTemplateExist = false;

    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === meta.name && info.isDir) {
        isThisTemplateExist = true;
      }
    });

    // 存在则失败
    if (isThisTemplateExist) {
      return false;
    }

    const res = await this.webgalFs.decompressedDirectory(
      source,
      this.webgalFs.getPathFromRoot(`/public/templates/${meta.name}`),
    );

    return res;
  }
}
