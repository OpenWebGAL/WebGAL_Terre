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
exports.HelloController = void 0;
const common_1 = require("@nestjs/common");
const hello_service_1 = require("./hello.service");
const webgal_fs_service_1 = require("../webgal-fs/webgal-fs.service");
let HelloController = class HelloController {
    constructor(helloService, webgalfs) {
        this.helloService = helloService;
        this.webgalfs = webgalfs;
    }
    apiTest() {
        this.webgalfs.greet();
        return this.helloService.getHelloText();
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], HelloController.prototype, "apiTest", null);
HelloController = __decorate([
    (0, common_1.Controller)('api/hello'),
    __metadata("design:paramtypes", [hello_service_1.HelloService,
        webgal_fs_service_1.WebgalFsService])
], HelloController);
exports.HelloController = HelloController;
//# sourceMappingURL=hello.controller.js.map