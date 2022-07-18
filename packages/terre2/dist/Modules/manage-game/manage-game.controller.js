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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageGameController = void 0;
const common_1 = require("@nestjs/common");
const webgal_fs_service_1 = require("../webgal-fs/webgal-fs.service");
const manage_game_service_1 = require("./manage-game.service");
let ManageGameController = class ManageGameController {
    constructor(webgalFs, manageGame) {
        this.webgalFs = webgalFs;
        this.manageGame = manageGame;
    }
    async testReadDir() {
        return await this.webgalFs.getDirInfo(this.webgalFs.getPathFromRoot('/public/games'));
    }
    async createGame(request) {
        const gameName = request.body.gameName;
        const createResult = await this.manageGame.createGame(gameName);
        if (createResult) {
            return { status: 'success' };
        }
        else {
            return { status: 'filed' };
        }
    }
    async readGameAssets(request) {
        const requestUrl = request.url;
        const readDirName = decodeURI(requestUrl.split('readGameAssets/')[1]);
        const dirPath = this.webgalFs.getPathFromRoot(`public/games/${readDirName}`);
        const dirInfo = await this.webgalFs.getDirInfo(dirPath);
        return { readDirName, dirPath, dirInfo };
    }
    async editFileName(request) {
        const requestBody = request.body;
        return await this.webgalFs.renameFile(requestBody.path, requestBody.newName);
    }
    async deleteFile(request) {
        const requestBody = request.body;
        return await this.webgalFs.deleteFile(requestBody.path);
    }
    async createNewScene(request) {
        const requestBody = request.body;
        const gameName = requestBody.gameName;
        const sceneName = requestBody.sceneName;
        const path = this.webgalFs.getPathFromRoot(`/public/games/${gameName}/game/scene/${sceneName}.txt`);
        return await this.webgalFs.createEmptyFile(path);
    }
    async getGameConfig(request) {
        const gameNameFromUrl = request.url.split('getGameConfig/')[1];
        const gameName = decodeURI(gameNameFromUrl);
        const configFilePath = this.webgalFs.getPathFromRoot(`/public/games/${gameName}/game/config.txt`);
        return await this.webgalFs.readTextFile(configFilePath);
    }
};
__decorate([
    (0, common_1.Get)('gameList'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "testReadDir", null);
__decorate([
    (0, common_1.Post)('createGame'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "createGame", null);
__decorate([
    (0, common_1.Get)('readGameAssets/*'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "readGameAssets", null);
__decorate([
    (0, common_1.Post)('editFileName/*'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "editFileName", null);
__decorate([
    (0, common_1.Post)('deleteFile/*'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)('createNewScene/*'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "createNewScene", null);
__decorate([
    (0, common_1.Get)('getGameConfig/*'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ManageGameController.prototype, "getGameConfig", null);
ManageGameController = __decorate([
    (0, common_1.Controller)('api/manageGame'),
    __metadata("design:paramtypes", [webgal_fs_service_1.WebgalFsService,
        manage_game_service_1.ManageGameService])
], ManageGameController);
exports.ManageGameController = ManageGameController;
//# sourceMappingURL=manage-game.controller.js.map