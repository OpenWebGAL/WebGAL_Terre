"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebgalFsService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path_1 = require("path");
let WebgalFsService = class WebgalFsService {
    constructor(logger) {
        this.logger = logger;
    }
    greet() {
        this.logger.log('Welcome to WebGAl Files System Service!');
    }
    async getDirInfo(dir) {
        const fileNames = await fs.readdir(dir);
        const dirInfoPromises = fileNames.map((e) => {
            const elementPath = this.getPath(`${dir}/${e}`);
            return new Promise((resolve) => {
                fs.stat(elementPath).then((result) => {
                    const ret = {
                        name: e,
                        isDir: result.isDirectory(),
                        extName: (0, path_1.extname)(elementPath),
                        path: elementPath,
                    };
                    resolve(ret);
                });
            });
        });
        return await Promise.all(dirInfoPromises);
    }
    async copy(src, dest) {
        return await fs.cp(src, dest, { recursive: true });
    }
    getPathFromRoot(rawPath) {
        return (0, path_1.join)(process.cwd(), ...rawPath.split('/'));
    }
    async mkdir(src, dirName) {
        return await fs.mkdir((0, path_1.join)(src, dirName));
    }
    getPath(rawPath) {
        return (0, path_1.join)(...rawPath.split('/'));
    }
    async renameFile(path, newName) {
        const oldPath = (0, path_1.join)(...path.split(/[\/\\]/g));
        const pathAsArray = path.split(/[\/\\]/g);
        const newPathAsArray = pathAsArray.slice(0, pathAsArray.length - 1);
        const newPath = (0, path_1.join)(...newPathAsArray, newName);
        return await new Promise((resolve) => {
            fs.rename(oldPath, newPath)
                .then(() => resolve('File renamed!'))
                .catch(() => resolve('File not exist!'));
        });
    }
    async deleteFile(path) {
        return await new Promise((resolve) => {
            this.logger.log(path);
            fs.unlink(path)
                .then(() => resolve('File Deleted'))
                .catch(() => resolve('File not exist!'));
        });
    }
    async createEmptyFile(path) {
        return await new Promise((resolve) => {
            fs.writeFile(path, '')
                .then(() => resolve('created'))
                .catch(() => resolve('path error or no right.'));
        });
    }
    async readTextFile(path) {
        return await new Promise((resolve) => {
            fs.readFile(path)
                .then((r) => resolve(r.toString()))
                .catch(() => resolve('file not exist'));
        });
    }
};
WebgalFsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [common_1.ConsoleLogger])
], WebgalFsService);
exports.WebgalFsService = WebgalFsService;
//# sourceMappingURL=webgal-fs.service.js.map