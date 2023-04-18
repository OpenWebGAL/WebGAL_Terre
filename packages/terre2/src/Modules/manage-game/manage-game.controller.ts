import {
  Body,
  ConsoleLogger,
  Controller,
  Get,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  IUploadFileInfo,
  WebgalFsService,
} from '../webgal-fs/webgal-fs.service';
import { Request } from 'express';
import { ManageGameService } from './manage-game.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LspService } from '../lsp/lsp.service';
import { logger } from 'webgal-origine-2/src/utils/logger';

@Controller('api/manageGame')
export class ManageGameController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageGame: ManageGameService,
    private readonly logger: ConsoleLogger,
    private readonly lspServerce: LspService,
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

  @Get('openGameAssetsDict/*')
  async openGameAssetsDict(@Req() request: Request) {
    const requestUrl = request.url;
    // 截取出有关要阅读的目录的信息
    const gameName = decodeURI(requestUrl.split('openGameAssetsDict/')[1]);
    this.manageGame.openAssetsDictionary(gameName).then();
  }

  @Get('ejectGameAsWeb/*')
  async ejectGameAsWeb(@Req() request: Request) {
    const requestUrl = request.url;
    // 截取出有关要阅读的目录的信息
    const gameName = decodeURI(requestUrl.split('ejectGameAsWeb/')[1]);
    this.manageGame
      .exportGame(gameName, 'web')
      .then(() => this.logger.log(`${gameName} export as web app`));
  }

  @Get('ejectGameAsExe/*')
  async ejectGameAsExe(@Req() request: Request) {
    const requestUrl = request.url;
    // 截取出有关要阅读的目录的信息
    const gameName = decodeURI(requestUrl.split('ejectGameAsExe/')[1]);
    this.manageGame
      .exportGame(gameName, 'electron-windows')
      .then(() => this.logger.log(`${gameName} export as exe`));
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

  @Post('editScene/*')
  async editScene(@Req() request: Request) {
    const requestBody = request.body;
    const gameName: string = requestBody.gameName;
    const sceneName: string = requestBody.sceneName;
    const content: { value: string } = JSON.parse(requestBody.sceneData);
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/scene/${sceneName}`,
    );
    // await this.lspServerce.updateDocument(sceneName, content.value);
    return await this.webgalFs.updateTextFile(path, content.value);
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

  @Post('setGameConfig/*')
  async setGameConfig(@Req() request: Request) {
    // 将新的配置文件写入
    const body = request.body;
    const gameName = body.gameName;
    const newConfig = body.newConfig;
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${gameName}/game/config.txt`,
    );
    return await this.webgalFs.updateTextFile(configFilePath, newConfig);
  }

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files,
    @Body('targetDirectory') targetDirectory: string,
  ) {
    console.log(`Target directory: ${targetDirectory}`);
    const fileInfos: IUploadFileInfo[] = files.map((file) => {
      return { fileName: file.originalname, file: file.buffer };
    });
    return await this.webgalFs.writeFiles(targetDirectory, fileInfos);
  }

  @Post('mkdir')
  async mkDir(@Body('source') source: string, @Body('name') name: string) {
    await this.webgalFs.mkdir(this.webgalFs.getPathFromRoot(source), name);
    return true;
  }

  @Post('delete')
  async deleteFileOrDir(@Body('source') source: string) {
    this.logger.log(source);
    return await this.webgalFs.deleteFileOrDirectory(
      this.webgalFs.getPathFromRoot(source),
    );
  }

  @Post('rename')
  async rename(
    @Body('source') source: string,
    @Body('newName') newName: string,
  ) {
    return await this.webgalFs.renameFile(
      this.webgalFs.getPathFromRoot(source),
      newName,
    );
  }
}
