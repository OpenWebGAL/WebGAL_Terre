import { ConsoleLogger, Injectable } from '@nestjs/common';
import { _open } from '../../util/open';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';
import * as process from 'process';
import * as asar from '@electron/asar';
import {
  CreateGameDto,
  GameInfoDto,
  IconsDto,
  Platform,
  platforms,
} from './manage-game.dto';
import { TemplateConfigDto } from '../manage-template/manage-template.dto';
import { promisify } from 'util';
import { execFile } from 'child_process';

@Injectable()
export class ManageGameService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

  /**
   * 获取游戏列表
   */
  async getGameList(): Promise<GameInfoDto[]> {
    // 如果游戏文件夹不存在就创建
    if (!(await this.webgalFs.existsDir('public/games')))
      await this.webgalFs.mkdir('public', 'games');
    const path = this.webgalFs.getPathFromRoot(`public/games`);
    const dirInfo = await this.webgalFs.getDirInfo(path);
    const gameList: Promise<GameInfoDto>[] = dirInfo
      .filter((item) => item.isDir)
      .map(async (item): Promise<GameInfoDto> => {
        try {
          const gameDir = item.name;
          const gameConfig = await this.getGameConfig(gameDir);
          let templateConfig: TemplateConfigDto = null;
          const configFilePath = this.webgalFs.getPathFromRoot(
            `/public/games/${gameDir}/game/template/template.json`,
          );
          if (await this.webgalFs.exists(configFilePath)) {
            const templateConfigString = await this.webgalFs.readTextFile(
              configFilePath,
            );
            templateConfig = JSON.parse(templateConfigString as string);
          }
          return {
            name: gameConfig.Game_name,
            dir: item.name,
            cover: gameConfig.Title_img,
            template: templateConfig,
          };
        } catch (_) {
          return null;
        }
      });
    return (await Promise.all(gameList)).filter((e) => e !== null);
  }

  /**
   * 打开游戏文件夹
   */
  async openGameDictionary(gameName: string) {
    const path = this.webgalFs.getPathFromRoot(`public/games/${gameName}`);
    await _open(path);
  }

  /**
   * 打开游戏资源文件夹
   */
  async openAssetsDictionary(gameName: string, subFolder?: string) {
    const path = this.webgalFs.getPathFromRoot(
      `public/games/${gameName}/game/${subFolder}`,
    );
    await _open(path);
  }

  /**
   * 从模板创建游戏
   * @param createGameData
   */
  async createGame(createGameData: CreateGameDto): Promise<boolean> {
    const { gameName, gameDir, derivative, templateDir } = createGameData;
    // 检查是否存在这个游戏
    const checkDir = await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot(`/public/games`),
    );
    let isThisGameExist = false;
    checkDir.forEach((e) => {
      const info: IFileInfo = e as IFileInfo;
      if (info.name === gameDir && info.isDir) {
        isThisGameExist = true;
      }
    });
    if (isThisGameExist) {
      return false;
    }
    // 创建文件夹
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot('/public/games'),
      gameDir,
    );
    if (derivative) {
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(
          `/assets/templates/Derivative_Engine/${derivative}/`,
        ),
        this.webgalFs.getPathFromRoot(`/public/games/${gameDir}/`),
      );
    } else {
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(
          '/assets/templates/WebGAL_Template/game/',
        ),
        this.webgalFs.getPathFromRoot(`/public/games/${gameDir}/game/`),
      );
    }

    await this.webgalFs.replaceTextFile(
      this.webgalFs.getPathFromRoot(`/public/games/${gameDir}/game/config.txt`),
      /Game_name:.*?;/,
      `Game_name:${gameName};`,
    );

    if (templateDir) {
      await this.webgalFs.copy(
        this.webgalFs.getPathFromRoot(`/public/templates/${templateDir}/`),
        this.webgalFs.getPathFromRoot(
          `/public/games/${gameDir}/game/template/`,
        ),
      );
    }

    return true;
  }

  // 获取游戏配置
  async getGameConfig(gameName: string) {
    interface Config {
      Game_name: string;
      Description: string;
      Game_key: string;
      Package_name: string;
      Title_img: string;
    }
    const config: Config = {
      Game_name: '',
      Description: '',
      Game_key: '',
      Package_name: '',
      Title_img: '',
    };
    // 根据 GameName 找到游戏所在目录
    const gameDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/`,
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
      ...config,
      Package_name:
        config.Package_name === ''
          ? 'com.openwebgal.demo'
          : config.Package_name,
    };
  }

  async getIcons(gameDir: string): Promise<IconsDto> {
    const iconsDir = this.webgalFs.getPathFromRoot(
      `/public/games/${gameDir}/icons`,
    );
    if (!(await this.webgalFs.existsDir(iconsDir))) {
      await this.webgalFs.mkdir(iconsDir, '');
    }
    const dirInfo = await this.webgalFs.getDirInfo(iconsDir);
    const platformDirs = dirInfo
      .map((dir) => dir.name)
      .filter((name) => platforms.includes(name as Platform));
    return {
      platforms: platformDirs as Platform[],
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
  ): Promise<boolean> {
    try {
      // 检查是否使用了衍生版本
      const gameRootDir = `/public/games/${gameName}/`;
      const checkIsEngineTemplateExist = async () => {
        const dirInfo = await this.webgalFs.getDirInfo(
          this.webgalFs.getPathFromRoot(gameRootDir),
        );
        return !!dirInfo.find((e) => e.name === 'index.html');
      };

      const isEngineTemplateExist = await checkIsEngineTemplateExist();

      // 根据 GameName 找到游戏所在目录
      const gameDir = this.webgalFs.getPathFromRoot(
        `/public/games/${gameName}/game/`,
      );
      // 如果导出文件夹不存在就创建
      if (!(await this.webgalFs.existsDir('Exported_Games')))
        await this.webgalFs.mkdir('Exported_Games', '');
      // 检查导出文件夹是否存在这个游戏
      const exportedGamesDir = await this.webgalFs.getDirInfo(
        this.webgalFs.getPathFromRoot(`/Exported_Games`),
      );
      let isThisGameExist = false;
      exportedGamesDir.forEach((e) => {
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
        if (process.platform === 'win32') {
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
          if (!isEngineTemplateExist)
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                '/assets/templates/WebGAL_Template',
              ),
              `${electronExportDir}/resources/app/public/`,
            );
          else
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(gameRootDir),
              `${electronExportDir}/resources/app/public/`,
            );
          // 修改 manifest.json
          await this.webgalFs.replaceTextFile(
            `${electronExportDir}/resources/app/public/manifest.json`,
            ['WebGAL DEMO', 'WebGAL'],
            [gameConfig.Description, gameConfig.Game_name],
          );
          // 删掉 Service Worker
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/public/webgal-serviceworker.js`,
          );
          // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/public/game/`,
          );
          await this.webgalFs.copy(
            gameDir,
            `${electronExportDir}/resources/app/public/game/`,
          );
          // 复制并替换可执行文件图标
          const icons = await this.getIcons(gameName);
          if (icons.platforms.includes('electron')) {
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                `/public/games/${gameName}/icons/electron/`,
              ),
              `${electronExportDir}/`,
            );
            try {
              const rceditPath = this.webgalFs.getPathFromRoot(
                '/lib/rcedit-x64.exe',
              );
              if (await this.webgalFs.exists(rceditPath)) {
                await promisify(execFile)(rceditPath, [
                  `${electronExportDir}/WebGAL.exe`,
                  '--set-icon',
                  `${electronExportDir}/icon.ico`,
                ]);
              } else {
                this.logger.log(`${rceditPath} 不存在, 跳过修改图标`);
              }
            } catch (error) {
              this.logger.error('无法修改图标', error);
            }
          }
          // 创建 app.asar
          await asar.createPackage(
            `${electronExportDir}/resources/app/`,
            `${electronExportDir}/resources/app.asar`,
          );
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/`,
          );
          await _open(electronExportDir);
        }
        if (process.platform === 'linux') {
          const electronExportDir = this.webgalFs.getPath(
            `${exportDir}/electron-linux`,
          );
          await this.webgalFs.mkdir(electronExportDir, '');
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(
              `/assets/templates/WebGAL_Electron_Template/`,
            ),
            `${electronExportDir}/`,
          );
          if (!isEngineTemplateExist)
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                '/assets/templates/WebGAL_Template',
              ),
              `${electronExportDir}/resources/app/public/`,
            );
          else
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(gameRootDir),
              `${electronExportDir}/resources/app/public/`,
            );
          // 修改 manifest.json
          await this.webgalFs.replaceTextFile(
            `${electronExportDir}/resources/app/public/manifest.json`,
            ['WebGAL DEMO', 'WebGAL'],
            [gameConfig.Description, gameConfig.Game_name],
          );
          // 删掉 Service Worker
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/public/webgal-serviceworker.js`,
          );
          // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/public/game/`,
          );
          await this.webgalFs.copy(
            gameDir,
            `${electronExportDir}/resources/app/public/game/`,
          );
          // 复制图标
          const icons = await this.getIcons(gameName);
          if (icons.platforms.includes('electron')) {
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                `/public/games/${gameName}/icons/electron/`,
              ),
              `${electronExportDir}/`,
            );
          }
          // 创建 app.asar
          await asar.createPackage(
            `${electronExportDir}/resources/app/`,
            `${electronExportDir}/resources/app.asar`,
          );
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/resources/app/`,
          );
          await _open(electronExportDir);
        }
        if (process.platform === 'darwin') {
          const electronExportDir = this.webgalFs.getPath(
            `${exportDir}/WebGAL.app`,
          );
          await this.webgalFs.mkdir(electronExportDir, '');
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(
              `/assets/templates/WebGAL_Electron_Template/`,
            ),
            `${electronExportDir}/`,
          );
          if (!isEngineTemplateExist)
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                '/assets/templates/WebGAL_Template',
              ),
              `${electronExportDir}/Contents/Resources/app/public/`,
            );
          else
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(gameRootDir),
              `${electronExportDir}/Contents/Resources/app/public/`,
            );
          // 修改 manifest.json
          await this.webgalFs.replaceTextFile(
            `${electronExportDir}/Contents/Resources/app/public/manifest.json`,
            ['WebGAL DEMO', 'WebGAL'],
            [gameConfig.Description, gameConfig.Game_name],
          );
          // 删掉 Service Worker
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/Contents/Resources/app/public/webgal-serviceworker.js`,
          );
          // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/Contents/Resources/app/public/game/`,
          );
          await this.webgalFs.copy(
            gameDir,
            `${electronExportDir}/Contents/Resources/app/public/game/`,
          );
          // 复制图标
          const icons = await this.getIcons(gameName);
          if (icons.platforms.includes('electron')) {
            await this.webgalFs.copy(
              this.webgalFs.getPathFromRoot(
                `/public/games/${gameName}/icons/electron/`,
              ),
              `${electronExportDir}/`,
            );
          }
          // 创建 app.asar
          await asar.createPackage(
            `${electronExportDir}/Contents/Resources/app/`,
            `${electronExportDir}/Contents/Resources/app.asar`,
          );
          await this.webgalFs.deleteFileOrDirectory(
            `${electronExportDir}/Contents/Resources/app/`,
          );
          await _open(exportDir);
        }
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
        if (!isEngineTemplateExist)
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
            `${androidExportDir}/app/src/main/assets/webgal/`,
          );
        else
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(gameRootDir),
            `${androidExportDir}/app/src/main/assets/webgal/`,
          );
        // 修改 manifest.json
        await this.webgalFs.replaceTextFile(
          `${androidExportDir}/app/src/main/assets/webgal/manifest.json`,
          ['WebGAL DEMO', 'WebGAL'],
          [gameConfig.Description, gameConfig.Game_name],
        );
        // 删掉 Service Worker
        await this.webgalFs.deleteFileOrDirectory(
          `${androidExportDir}/app/src/main/assets/webgal/webgal-serviceworker.js`,
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
          gameConfig.Game_name,
        );
        await this.webgalFs.replaceTextFile(
          `${androidExportDir}/app/build.gradle`,
          'com.openwebgal.demo',
          gameConfig.Package_name,
        );
        await this.webgalFs.replaceTextFile(
          `${androidExportDir}/app/src/main/java/MainActivity.kt`,
          'com.openwebgal.demo',
          gameConfig.Package_name,
        );
        await this.webgalFs.mkdir(
          // eslint-disable-next-line prettier/prettier
          `${androidExportDir}/app/src/main/java/${gameConfig.Package_name.replace(/\./g, '/')}`,
          '',
        );
        await this.webgalFs.copy(
          `${androidExportDir}/app/src/main/java/MainActivity.kt`,
          // eslint-disable-next-line prettier/prettier
          `${androidExportDir}/app/src/main/java/${gameConfig.Package_name.replace(/\./g, '/')}/MainActivity.kt`
        );
        await this.webgalFs.deleteFileOrDirectory(
          `${androidExportDir}/app/src/main/java/MainActivity.kt`,
        );
        // 复制图标
        const icons = await this.getIcons(gameName);
        if (icons.platforms.includes('android')) {
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(
              `/public/games/${gameName}/icons/android`,
            ),
            `${androidExportDir}/app/src/main/res/`,
          );
          await this.webgalFs.copy(
            `${androidExportDir}/app/src/main/res/ic_launcher-playstore.png`,
            `${androidExportDir}/app/src/main/ic_launcher-playstore.png`,
          );
          this.webgalFs.deleteFileOrDirectory(
            `${androidExportDir}/app/src/main/res/ic_launcher-playstore.png`,
          );
        }
        await _open(androidExportDir);
      }
      // 导出 Web
      if (ejectPlatform === 'web') {
        const webExportDir = this.webgalFs.getPath(`${exportDir}/web`);
        await this.webgalFs.mkdir(webExportDir, '');
        if (!isEngineTemplateExist)
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template'),
            `${webExportDir}/`,
          );
        else
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(gameRootDir),
            `${webExportDir}/`,
          );
        // 修改 manifest.json
        await this.webgalFs.replaceTextFile(
          `${webExportDir}/manifest.json`,
          ['WebGAL DEMO', 'WebGAL'],
          [gameConfig.Description, gameConfig.Game_name],
        );
        // 复制图标
        const icons = await this.getIcons(gameName);
        if (icons.platforms.includes('web')) {
          await this.webgalFs.copy(
            this.webgalFs.getPathFromRoot(
              `/public/games/${gameName}/icons/web/`,
            ),
            `${webExportDir}/icons/`,
          );
        }
        // 复制游戏前尝试删除文件夹，防止游戏素材更改后有多余文件
        await this.webgalFs.deleteFileOrDirectory(`${webExportDir}/game/`);
        await this.webgalFs.copy(gameDir, `${webExportDir}/game/`);
        await _open(webExportDir);
      }

      return true;
    } catch (error) {
      this.logger.error('Error exporting game:', error);
      return false;
    }
  }
}
