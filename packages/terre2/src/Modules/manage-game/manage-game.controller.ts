import { Controller, Get, Post, Req } from '@nestjs/common';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import { Request } from 'express';
import { ManageGameService } from './manage-game.service';

@Controller('api/manageGame')
export class ManageGameController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageGame: ManageGameService,
  ) {}

  @Get('gameList')
  async testReadDir() {
    return await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot('/public/games'),
    );
  }

  @Post('createGame')
  async createGame(@Req() request: Request) {
    const gameName = request.body.gameName;
    const createResult = await this.manageGame.createGame(gameName);
    if (createResult) {
      return { status: 'success' };
    } else {
      return { status: 'filed' };
    }
  }

  @Get('readGameAssets/*')
  async readGameAssets(@Req() request: Request) {
    const requestUrl = request.url;
    // 截取出有关要阅读的目录的信息
    const readDirName = decodeURI(requestUrl.split('readGameAssets/')[1]);
    const dirPath = this.webgalFs.getPathFromRoot(
      `public/games/${readDirName}`,
    );
    const dirInfo = await this.webgalFs.getDirInfo(dirPath);
    return { readDirName, dirPath, dirInfo };
  }
}
