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
exports.ManageGameService = void 0;
const common_1 = require("@nestjs/common");
const webgal_fs_service_1 = require("../webgal-fs/webgal-fs.service");
let ManageGameService = class ManageGameService {
    constructor(logger, webgalFs) {
        this.logger = logger;
        this.webgalFs = webgalFs;
    }
    async createGame(gameName) {
        const checkDir = await this.webgalFs.getDirInfo(this.webgalFs.getPathFromRoot(`/public/games`));
        let isThisGameExist = false;
        checkDir.forEach((e) => {
            const info = e;
            if (info.name === gameName && info.isDir) {
                isThisGameExist = true;
            }
        });
        if (isThisGameExist) {
            return false;
        }
        await this.webgalFs.mkdir(this.webgalFs.getPathFromRoot('/public/games'), gameName);
        await this.webgalFs.copy(this.webgalFs.getPathFromRoot('/assets/templates/WebGAL_Template/game/'), this.webgalFs.getPathFromRoot(`/public/games/${gameName}/game/`));
        return true;
    }
};
ManageGameService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [common_1.ConsoleLogger,
        webgal_fs_service_1.WebgalFsService])
], ManageGameService);
exports.ManageGameService = ManageGameService;
//# sourceMappingURL=manage-game.service.js.map