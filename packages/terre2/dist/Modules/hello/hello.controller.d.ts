import { HelloService } from './hello.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
export declare class HelloController {
    private readonly helloService;
    private readonly webgalfs;
    constructor(helloService: HelloService, webgalfs: WebgalFsService);
    apiTest(): string;
}
