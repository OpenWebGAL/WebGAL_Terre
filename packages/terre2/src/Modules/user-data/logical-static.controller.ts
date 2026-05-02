import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UserDataService } from './user-data.service';

@ApiExcludeController()
@Controller()
export class LogicalStaticController {
  @Get()
  async getEditorIndex(@Res() res: Response) {
    return this.sendPublicFile('index.html', res);
  }

  @Get('favicon.ico')
  async getFavicon(@Res() res: Response) {
    return this.sendPublicFile('favicon.ico', res);
  }

  @Get('assets/:filePath(*)')
  async getEditorAsset(
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    return this.sendPublicFile(`assets/${filePath}`, res);
  }

  @Get('monaco-iframe/:filePath(*)')
  async getMonacoAsset(
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    return this.sendPublicFile(`monaco-iframe/${filePath}`, res);
  }

  @Get('wasm/:filePath(*)')
  async getWasmAsset(
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    return this.sendPublicFile(`wasm/${filePath}`, res);
  }

  @Get('games/:gameName')
  async getGameIndex(
    @Param('gameName') gameName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!this.isDirectoryRequest(req)) {
      return this.redirectToDirectoryUrl(req, res);
    }
    return this.sendGameFile(gameName, '', res);
  }

  @Get('games/:gameName/:filePath(*)')
  async getGameFile(
    @Param('gameName') gameName: string,
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    return this.sendGameFile(gameName, filePath, res);
  }

  @Get('templates/:templateName/:filePath(*)')
  async getTemplateFile(
    @Param('templateName') templateName: string,
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    const targetPath = await UserDataService.resolveReadableTemplateFile(
      decodeURI(templateName),
      decodeURI(filePath ?? ''),
    );
    return this.sendFile(targetPath, res);
  }

  @Get('template-preview/:templateName')
  async getTemplatePreviewIndex(
    @Param('templateName') templateName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!this.isDirectoryRequest(req)) {
      return this.redirectToDirectoryUrl(req, res);
    }
    return this.sendTemplatePreviewFile(templateName, '', res);
  }

  @Get('template-preview/:templateName/:filePath(*)')
  async getTemplatePreviewFile(
    @Param('templateName') templateName: string,
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    return this.sendTemplatePreviewFile(templateName, filePath, res);
  }

  private async sendGameFile(
    rawGameName: string,
    rawFilePath: string,
    res: Response,
  ) {
    const gameName = decodeURI(rawGameName);
    const filePath = this.normalizeRequestPath(rawFilePath);
    const requestPath = filePath === '' ? 'index.html' : filePath;
    const gameRoot = UserDataService.getGameRoot(gameName);
    const engineRoot = UserDataService.getEngineTemplateRoot();
    const gameIndex = path.join(gameRoot, 'index.html');
    const hasCustomEngine = await this.pathIsFile(gameIndex);
    const gameFile = this.safeJoin(gameRoot, requestPath);
    const engineFile = this.safeJoin(engineRoot, requestPath);
    const candidates =
      hasCustomEngine || this.isGameProjectFile(requestPath)
        ? [gameFile, engineFile]
        : [engineFile];

    return this.sendFirstExistingFile(candidates, res);
  }

  private async sendTemplatePreviewFile(
    rawTemplateName: string,
    rawFilePath: string,
    res: Response,
  ) {
    const templateName = decodeURI(rawTemplateName);
    const filePath = this.normalizeRequestPath(rawFilePath);
    const requestPath = filePath === '' ? 'index.html' : filePath;
    const templatePrefix = 'game/template/';

    if (requestPath.startsWith(templatePrefix)) {
      const templateFilePath = requestPath.slice(templatePrefix.length);
      const targetPath = await UserDataService.resolveReadableTemplateFile(
        templateName,
        templateFilePath,
      );
      return this.sendFile(targetPath, res);
    }

    return this.sendFile(UserDataService.getEngineTemplateRoot(requestPath), res);
  }

  private async sendPublicFile(rawFilePath: string, res: Response) {
    const filePath = this.normalizeRequestPath(rawFilePath);
    return this.sendFile(UserDataService.getInstallPath(`public/${filePath}`), res);
  }

  private async sendFirstExistingFile(candidates: string[], res: Response) {
    for (const candidate of candidates) {
      if (await this.pathIsFile(candidate)) {
        return this.sendFile(candidate, res);
      }
    }
    throw new NotFoundException('The requested file does not exist.');
  }

  private isDirectoryRequest(req: Request) {
    const pathname = req.originalUrl.split('?')[0];
    return pathname.endsWith('/');
  }

  private redirectToDirectoryUrl(req: Request, res: Response) {
    const [pathname, query = ''] = req.originalUrl.split('?');
    return res.redirect(302, `${pathname}/${query ? `?${query}` : ''}`);
  }

  private async sendFile(filePath: string, res: Response) {
    if (!(await this.pathIsFile(filePath))) {
      throw new NotFoundException('The requested file does not exist.');
    }
    return new Promise<void>((resolve, reject) => {
      res.sendFile(filePath, (error: NodeJS.ErrnoException) => {
        if (error) {
          if (this.isRequestAbortError(error)) {
            resolve();
            return;
          }
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private isRequestAbortError(error: NodeJS.ErrnoException) {
    return error.code === 'ECONNABORTED';
  }

  private normalizeRequestPath(rawPath: string) {
    return decodeURI(rawPath ?? '').replace(/\\/g, '/').replace(/^\/+/, '');
  }

  private isGameProjectFile(requestPath: string) {
    return requestPath === 'game' || requestPath.startsWith('game/');
  }

  private safeJoin(root: string, relativePath: string) {
    const targetPath = path.resolve(root, relativePath);
    const relative = path.relative(path.resolve(root), targetPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new NotFoundException('The requested file does not exist.');
    }
    return targetPath;
  }

  private async pathIsFile(targetPath: string) {
    return fs
      .stat(targetPath)
      .then((stat) => stat.isFile())
      .catch(() => false);
  }
}
