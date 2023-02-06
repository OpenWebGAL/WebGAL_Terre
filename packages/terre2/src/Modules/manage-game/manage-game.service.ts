import { ConsoleLogger, Injectable } from '@nestjs/common';
import { _open } from 'src/util/open';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Injectable()
export class ManageGameService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 打开游戏资源文件夹
   */
  async openAssetsDictionary(gameName: string) {
    const path = this.webgalFs.getPathFromRoot(`public/games/${gameName}/game`);
    await _open(path);
  }
  /**
   * 从模板创建游戏
   * @param gameName
   */
  async createGame(gameName: string): Promise<boolean> {
    // 检查是否存在这个游戏
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/games`),
    );
    let isThisGameExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === gameName && info.isDir) {
        isThisGameExist = true;
      }
    });
    if (isThisGameExist) {
      return false;
    }
    // 创建文件夹
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot('/public/games'),
      gameName,
    );
    // 递归复制
    await this.webgalFs.copy(
      this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template/game/'),
      this.webgalFs.getPathFromRoot(`/public/games/${gameName}/game/`),
    );
    return true;
  }

  /**
   * 导出游戏
   * @param gameName 游戏名称
   * @param ejectPlatform 导出平台
   */
  async exportGame(
    gameName: string,
    ejectPlatform: 'web' | 'electron-windows',
  ) {
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/Games/${gameName}/game/`,
    );
    // 检查是否存在这个游戏
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/Exported_Games`),
    );
    let isThisGameExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === gameName && info.isDir) {
        isThisGameExist = true;
      }
    });
    const exportDir = this.webgalFs.getPathFromRoot(
      `/Exported_Games/${gameName}`,
    );
    if (!isThisGameExist) {
      // 创建游戏导出目录
      await this.webgalFs.mkdir(exportDir, '');
    }

    // 将游戏复制到导出目录，并附加对应的模板
    if (ejectPlatform === 'electron-windows') {
      const electronExportDir = this.webgalFs.getPath(
        `${exportDir}/electron-windows`,
      );
      await this.webgalFs.mkdir(electronExportDir, '');
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(
          `/assets/templates/WebGAL_Electron_Template/`,
        ),
        `${electronExportDir}/`,
      );
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
        `${electronExportDir}/resources/app/public/`,
      );
      await this.webgalFs.copy(
        gameDir,
        `${electronExportDir}/resources/app/public/game/`,
      );
      await _open(electronExportDir);
    }
    if (ejectPlatform === 'web') {
      const webExportDir = this.webgalFs.getPath(`${exportDir}/web`);
      await this.webgalFs.mkdir(webExportDir, '');
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
        `${webExportDir}/`,
      );
      await this.webgalFs.copy(gameDir, `${webExportDir}/game/`);
      await _open(webExportDir);
    }
  }
}
