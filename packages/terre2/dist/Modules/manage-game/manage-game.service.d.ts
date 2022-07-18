import { ConsoleLogger } from '@nestjs/common';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
export declare class ManageGameService {
    private readonly logger;
    private readonly webgalFs;
    constructor(logger: ConsoleLogger, webgalFs: WebgalFsService);
    createGame(gameName: string): Promise<boolean>;
}
