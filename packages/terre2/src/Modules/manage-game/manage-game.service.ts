import { ConsoleLogger, Injectable } from '@nestjs/common';
import { _open } from 'src/util/open';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Injectable()
export class ManageGameService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) { }

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

  // 获取游戏配置
  async getGameConfig(gameName: string) {
    interface Config {
      Game_name: string;
      Game_key: string;
      Package_name: string;
    }
    const config: Config = {
      Game_name: '',
      Game_key: '',
      Package_name: '',
    };
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/Games/${gameName}/game/`,
    );
    // 读取配置文件
    const configFile: string | unknown = await this.webgalFs.readTextFile(
      `${gameDir}/config.txt`,
    );
    if (typeof configFile === 'string') {
      configFile
        .replace(/[\r\n]/g, '')
        .split(';')
        .filter((commandText) => commandText !== '')
        .map((commandText) => {
          const i = commandText.indexOf(':');
          const arr = [commandText.slice(0, i), commandText.slice(i + 1)];
          config[arr[0]] = arr[1];
        });
    }
    return {
      gameName: config.Game_name === '' ? 'WebGAL' : config.Game_name,
      packageName:
        config.Package_name === ''
          ? 'com.openwebgal.demo'
          : config.Package_name,
    };
  }

  /**
   * 导出游戏
   * @param gameName 游戏名称
   * @param ejectPlatform 导出平台
   */
  async exportGame(
    gameName: string,
    ejectPlatform: 'web' | 'electron-windows' | 'android',
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
    // 获取游戏配置
    const gameConfig = await this.getGameConfig(gameName);
    // 获取导出目录
    const exportDir = this.webgalFs.getPathFromRoot(
      `/Exported_Games/${gameName}`,
    );
    if (!isThisGameExist) {
      // 创建游戏导出目录
      await this.webgalFs.mkdir(exportDir, '');
    }

    // 将游戏复制到导出目录，并附加对应的模板
    // 导出 electron-windows
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
      // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(
        `${electronExportDir}/resources/app/public/game/`,
      );
      await this.webgalFs.copy(
        gameDir,
        `${electronExportDir}/resources/app/public/game/`,
      );
      await _open(electronExportDir);
    }
    // 导出 android
    if (ejectPlatform === 'android') {
      const androidExportDir = this.webgalFs.getPath(`${exportDir}/android`);
      await this.webgalFs.mkdir(androidExportDir, '');
      // 复制模板前尝试删除文件夹，防止包名更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/java/`,
      );
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(
          `/assets/templates/WebGAL_Android_Template/`,
        ),
        `${androidExportDir}/`,
      );
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
        `${androidExportDir}/app/src/main/assets/webgal/`,
      );
      // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/assets/webgal/game/`,
      );
      await this.webgalFs.copy(
        gameDir,
        `${androidExportDir}/app/src/main/assets/webgal/game/`,
      );
      // 修改信息
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/settings.gradle`,
        'WebGAL',
        gameName,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/src/main/res/values/strings.xml`,
        'WebGAL',
        gameConfig.gameName,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/build.gradle`,
        'com.openwebgal.demo',
        gameConfig.packageName,
      );
      await this.webgalFs.replaceTextFile(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
        'com.openwebgal.demo',
        gameConfig.packageName,
      );
      await this.webgalFs.mkdir(
        // eslint-disable-next-line prettier/prettier
        `${androidExportDir}/app/src/main/java/${gameConfig.packageName.replace(/\./g, '/')}`,
        '',
      );
      await this.webgalFs.copy(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
        // eslint-disable-next-line prettier/prettier
        `${androidExportDir}/app/src/main/java/${gameConfig.packageName.replace(/\./g, '/')}/MainActivity.kt`
      );
      await this.webgalFs.deleteFileOrDirectory(
        `${androidExportDir}/app/src/main/java/MainActivity.kt`,
      );
      await _open(androidExportDir);
    }
    // 导出 Web
    if (ejectPlatform === 'web') {
      const webExportDir = this.webgalFs.getPath(`${exportDir}/web`);
      await this.webgalFs.mkdir(webExportDir, '');
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
        `${webExportDir}/`,
      );
      // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
      await this.webgalFs.deleteFileOrDirectory(`${webExportDir}/game/`);
      await this.webgalFs.copy(gameDir, `${webExportDir}/game/`);
      await _open(webExportDir);
    }
  }
}
