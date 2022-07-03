import { ConsoleLogger, Injectable } from '@nestjs/common';
import { IFileInfo, WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Injectable()
export class ManageGameService {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly webgalFs: WebgalFsService,
  ) {}

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
}
