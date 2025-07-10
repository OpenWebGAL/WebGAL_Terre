import {
  BadRequestException,
  Body,
  ConsoleLogger,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  IUploadFileInfo,
  WebgalFsService,
} from '../webgal-fs/webgal-fs.service';
import { ManageGameService } from './manage-game.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateGameDto,
  CreateNewSceneDto,
  DeleteDto,
  DeleteFileDto,
  EditFileNameDto,
  EditSceneDto,
  EditTextFileDto,
  GameConfigDto,
  GameInfoDto,
  IconsDto,
  MkDirDto,
  RenameDto,
  UploadFilesDto,
} from './manage-game.dto';

@Controller('api/manageGame')
@ApiTags('Manage Game')
export class ManageGameController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageGame: ManageGameService,
    private readonly logger: ConsoleLogger,
  ) {}

  @Get('gameList')
  @Get('gameList')
  @ApiOperation({ summary: 'Retrieve game list' })
  @ApiResponse({
    status: 200,
    type: [GameInfoDto],
    description: 'Returned game list.',
  })
  async getGameList(): Promise<GameInfoDto[]> {
    return await this.manageGame.getGameList();
  }

  @Post('createGame')
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: 200, description: 'Game creation result.' })
  @ApiBody({ type: CreateGameDto, description: 'Game creation data' })
  async createGame(@Body() createGameData: CreateGameDto) {
    const createResult = await this.manageGame.createGame(createGameData);
    if (createResult) {
      return { status: 'success' };
    } else {
      return { status: 'failed' }; // Note: Typo correction 'filed' -> 'failed'
    }
  }

  @Get('openGameDict/:gameName') // <-- Define the route parameter using :gameName
  @ApiOperation({ summary: 'Open Game Dictionary' })
  @ApiResponse({
    status: 200,
    description: 'Opens the dictionary for a specified game.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game.',
  }) // <-- Swagger description for the route parameter
  async openGameDict(@Param('gameName') gameName: string) {
    // <-- Use @Param decorator to fetch the gameName
    gameName = decodeURI(gameName); // Optionally decode the URI if necessary
    this.manageGame.openGameDictionary(gameName).then();
  }

  @Get('derivativeEngines')
  @ApiOperation({ summary: 'Retrieve Derivative Engines' }) // <-- Provide a summary description of the endpoint's purpose
  @ApiResponse({
    status: 200,
    description:
      'Returns a list of directories representing available derivative engines.',
  }) // <-- Describe the response and status code of this endpoint
  async getDerivativeEngines() {
    const path = this.webgalFs.getPathFromRoot(
      '/assets/templates/Derivative_Engine/',
    );
    if (!(await this.webgalFs.existsDir(path))) {
      await this.webgalFs.mkdir(
        this.webgalFs.getPathFromRoot('/assets/templates'),
        'Derivative_Engine',
      );
    }
    const readDirResult = await this.webgalFs.getDirInfo(path);
    return readDirResult.filter((e) => e.isDir).map((e) => e.name);
  }

  @Get('openGameAssetsDict/:gameName') // <-- Define the route parameter using :gameName
  @ApiOperation({ summary: 'Open Game Assets Dictionary' })
  @ApiResponse({
    status: 200,
    description: 'Opens the assets dictionary for a specified game.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game.',
  })
  async openGameAssetsDict(
    @Param('gameName') gameName: string,
    @Query('subFolder') subFolder: string,
  ) {
    gameName = decodeURI(gameName); // Optionally decode the URI if necessary
    this.manageGame.openAssetsDictionary(gameName, subFolder).then();
  }

  @Get('ejectGameAsWeb/:gameName') // Use :gameName to define the route parameter
  @ApiOperation({ summary: 'Eject Game As Web App' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as a web app.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as web app.',
  }) // Swagger description for the route parameter
  async ejectGameAsWeb(@Param('gameName') gameName: string) {
    // Fetch gameName using @Param decorator
    gameName = decodeURI(gameName); // Optionally decode the URI
    const result = await this.manageGame.exportGame(gameName, 'web');
    result && this.logger.log(`${gameName} exported as web app`);
  }

  @Get('ejectGameAsExe/:gameName')
  @ApiOperation({ summary: 'Eject Game As EXE' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as an EXE (Windows Electron App).',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as EXE.',
  })
  async ejectGameAsExe(@Param('gameName') gameName: string) {
    gameName = decodeURI(gameName);
    const result = await this.manageGame.exportGame(
      gameName,
      'electron-windows',
    );
    result && this.logger.log(`${gameName} export as exe`);
  }

  @Get('ejectGameAsAndroid/:gameName')
  @ApiOperation({ summary: 'Eject Game As Android App' })
  @ApiResponse({
    status: 200,
    description: 'Exports the specified game as an Android app.',
  })
  @ApiParam({
    name: 'gameName',
    type: String,
    description: 'Name of the game to be exported as an Android app.',
  })
  async ejectGameAsAndroid(@Param('gameName') gameName: string) {
    gameName = decodeURI(gameName);
    const result = await this.manageGame.exportGame(gameName, 'android');
    result && this.logger.log(`${gameName} export as android`);
  }

  @Get('readGameAssets/:readDirPath(*)')
  @ApiOperation({ summary: 'Read Game Assets' })
  @ApiResponse({
    status: 200,
    description: 'Retrieve the assets of the specified game directory.',
  })
  @ApiParam({
    name: 'readDirPath',
    type: String,
    description:
      'Path of the game directory to read assets from, including subdirectories.',
  })
  async readGameAssets(@Param('readDirPath') readDirPath: string) {
    readDirPath = decodeURI(readDirPath);
    const dirPath = this.webgalFs.getPathFromRoot(
      `public/games/${readDirPath}`,
    );
    const dirInfo = await this.webgalFs.getDirInfo(dirPath);
    return { readDirPath, dirPath, dirInfo };
  }

  @Post('editFileName')
  @ApiOperation({ summary: 'Edit File Name' })
  @ApiResponse({ status: 200, description: 'Successfully renamed the file.' })
  @ApiResponse({ status: 400, description: 'Failed to rename the file.' })
  @ApiBody({ type: EditFileNameDto, description: 'File renaming data' })
  async editFileName(@Body() editFileNameData: EditFileNameDto) {
    return await this.webgalFs.renameFile(
      editFileNameData.path,
      editFileNameData.newName,
    );
  }

  @Post('deleteFile')
  @ApiOperation({ summary: 'Delete File' })
  @ApiResponse({ status: 200, description: 'Successfully deleted the file.' })
  @ApiResponse({ status: 400, description: 'Failed to delete the file.' })
  @ApiBody({ type: DeleteFileDto, description: 'File deletion data' })
  async deleteFile(@Body() deleteFileData: DeleteFileDto) {
    return await this.webgalFs.deleteFile(deleteFileData.path);
  }

  @Post('createNewScene')
  @ApiOperation({ summary: 'Create a New Scene' })
  @ApiResponse({ status: 200, description: 'Successfully created the scene.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to create the scene or scene already exists.',
  })
  @ApiBody({ type: CreateNewSceneDto, description: 'Scene creation data' })
  async createNewScene(
    @Body() createNewSceneData: CreateNewSceneDto,
  ): Promise<string | void> {
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${createNewSceneData.gameName}/game/scene/${createNewSceneData.sceneName}.txt`,
    );

    if (await this.webgalFs.exists(path)) {
      throw new BadRequestException('Scene already exists');
    }

    return this.webgalFs.createEmptyFile(path);
  }

  @Post('editScene')
  @ApiOperation({ summary: 'Edit Scene' })
  @ApiResponse({ status: 200, description: 'Scene edited successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to edit the scene.' })
  async editScene(@Body() editSceneData: EditSceneDto) {
    const path = this.webgalFs.getPathFromRoot(
      `/public/games/${editSceneData.gameName}/game/scene/${editSceneData.sceneName}`,
    );
    const sceneData = JSON.parse(editSceneData.sceneData) as { value: string };
    return this.webgalFs.updateTextFile(path, sceneData.value);
  }

  @Post('editTextFile')
  @ApiOperation({ summary: 'Edit TextFile' })
  @ApiResponse({ status: 200, description: 'File edited successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to edit the file.' })
  async editTextFile(@Body() editTextFileData: EditTextFileDto) {
    const path = editTextFileData.path;
    const filePath = this.webgalFs.getPathFromRoot(`public/${path}`);
    return this.webgalFs.updateTextFile(filePath, editTextFileData.textFile);
  }

  @Get('getGameConfig/:gameName')
  @ApiOperation({ summary: 'Get Game Configuration' })
  @ApiResponse({ status: 200, description: 'Returned game configuration.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to get the game configuration.',
  })
  async getGameConfig(@Param('gameName') gameName: string) {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${decodeURI(gameName)}/game/config.txt`,
    );
    return this.webgalFs.readTextFile(configFilePath);
  }

  @Post('setGameConfig')
  @ApiOperation({ summary: 'Set Game Configuration' })
  @ApiResponse({
    status: 200,
    description: 'Game configuration set successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to set the game configuration.',
  })
  async setGameConfig(@Body() gameConfigData: GameConfigDto) {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/games/${gameConfigData.gameName}/game/config.txt`,
    );
    return this.webgalFs.updateTextFile(
      configFilePath,
      gameConfigData.newConfig,
    );
  }

  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload Files' })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to upload files.' })
  async uploadFiles(
    @UploadedFiles() files,
    @Body() uploadFilesDto: UploadFilesDto,
  ) {
    const fileInfos: IUploadFileInfo[] = files.map((file) => {
      return { fileName: file.originalname, file: file.buffer };
    });
    return this.webgalFs.writeFiles(uploadFilesDto.targetDirectory, fileInfos);
  }

  @Post('mkdir')
  @ApiOperation({ summary: 'Create Directory' })
  @ApiResponse({ status: 200, description: 'Directory created successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to create directory.' })
  async mkDir(@Body() fileOperationDto: MkDirDto) {
    await this.webgalFs.mkdir(
      this.webgalFs.getPathFromRoot(fileOperationDto.source),
      fileOperationDto.name,
    );
    return true;
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete File or Directory' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the file or directory.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete the file or directory.',
  })
  async delete(@Body() deleteDto: DeleteDto) {
    return this.webgalFs.deleteFileOrDirectory(
      this.webgalFs.getPathFromRoot(`public/games/${deleteDto.gameName}`),
    );
  }

  @Post('rename')
  @ApiOperation({ summary: 'Rename File or Directory' })
  @ApiResponse({
    status: 200,
    description: 'Successfully renamed the file or directory.',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to rename the file or directory.',
  })
  async rename(@Body() fileOperationDto: RenameDto) {
    return this.webgalFs.renameFile(
      this.webgalFs.getPathFromRoot(
        `public/games/${fileOperationDto.gameName}`,
      ),
      fileOperationDto.newName,
    );
  }

  @Get('getIcons/:gameDir')
  @ApiOperation({ summary: 'Get Game Icons' })
  @ApiResponse({
    status: 200,
    type: IconsDto,
    description: 'Returned game icons.',
  })
  @ApiResponse({ status: 400, description: 'Failed to get the game icons.' })
  async getIcons(@Param('gameDir') gameDir: string): Promise<IconsDto> {
    return this.manageGame.getIcons(gameDir);
  }
}
