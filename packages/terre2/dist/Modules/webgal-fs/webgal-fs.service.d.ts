import { ConsoleLogger } from '@nestjs/common';
export interface IFileInfo {
    name: string;
    isDir: boolean;
    extName: string;
    path: string;
}
export declare class WebgalFsService {
    private readonly logger;
    constructor(logger: ConsoleLogger);
    greet(): void;
    getDirInfo(dir: string): Promise<unknown[]>;
    copy(src: string, dest: string): Promise<void>;
    getPathFromRoot(rawPath: string): string;
    mkdir(src: any, dirName: any): Promise<void>;
    getPath(rawPath: string): string;
    renameFile(path: string, newName: string): Promise<unknown>;
    deleteFile(path: string): Promise<unknown>;
    createEmptyFile(path: string): Promise<unknown>;
    readTextFile(path: string): Promise<unknown>;
}
