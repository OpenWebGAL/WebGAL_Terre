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

  @Post('editFileName/*')
  async editFileName(@Req() request: Request) {
    const requestBody = request.body;
    return await this.webgalFs.renameFile(
      requestBody.path,
      requestBody.newName,
    );
  }

  @Post('deleteFile/*')
  async deleteFile(@Req() request: Request) {
    const requestBody = request.body;
    return await this.webgalFs.deleteFile(requestBody.path);
  }

  @Post('createNewScene/*')
  async createNewScene(@Req() request: Request) {
    const requestBody = request.body;
    const gameName: string = requestBody.gameName;
    const sceneName: string = requestBody.sceneName;
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/scene/${sceneName}.txt`,
    );
    return await this.webgalFs.createEmptyFile(path);
  }

  @Get('getGameConfig/*')
  async getGameConfig(@Req() request: Request) {
    // 截取出游戏名称
    const gameNameFromUrl: string = request.url.split('getGameConfig/')[1];
    const gameName = decodeURI(gameNameFromUrl);
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/config.txt`,
    );
    return await this.webgalFs.readTextFile(configFilePath);
  }
}
