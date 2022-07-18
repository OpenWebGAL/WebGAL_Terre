import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import { Request } from 'express';
import { ManageGameService } from './manage-game.service';
export declare class ManageGameController {
    private readonly webgalFs;
    private readonly manageGame;
    constructor(webgalFs: WebgalFsService, manageGame: ManageGameService);
    testReadDir(): Promise<unknown[]>;
    createGame(request: Request): Promise<{
        status: string;
    }>;
    readGameAssets(request: Request): Promise<{
        readDirName: string;
        dirPath: string;
        dirInfo: unknown[];
    }>;
    editFileName(request: Request): Promise<unknown>;
    deleteFile(request: Request): Promise<unknown>;
    createNewScene(request: Request): Promise<unknown>;
    getGameConfig(request: Request): Promise<unknown>;
}
