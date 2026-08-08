import * as fs from 'fs/promises';
import * as path from 'path';
import { createRequire } from 'module';
import { LspLauncher } from './types';
import { UserDataService } from '../../user-data/user-data.service';
import { ConsoleLogger } from '@nestjs/common';

export interface ThirdPartyServerInfo {
  id: string;
  name: string;
}

export class ScannerService {
  private launcherMap = new Map<string, LspLauncher>();
  private readonly logger = new ConsoleLogger('ScannerService');

  async scanServers(): Promise<{ servers: ThirdPartyServerInfo[] }> {
    let state;
    try {
      state = UserDataService.getState();
    } catch (error) {
      this.logger.warn('UserDataService not initialized, cannot scan third-party servers.');
      return { servers: [] };
    }

    const serverRoot = path.join(state.activeUserDataRoot, 'third-party-ls');
    const servers: ThirdPartyServerInfo[] = [];

    try {
      await fs.access(serverRoot);
    } catch {
      this.logger.log(`Third-party server directory not found: ${serverRoot}`);
      return { servers };
    }

    const entries = await fs.readdir(serverRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const serverDir = path.join(serverRoot, entry.name);
      const startPath = path.join(serverDir, 'start.js');

      try {
        await fs.access(startPath);
      } catch {
        continue;
      }

      try {
        // 使用 createRequire 从 start.js 路径创建 require 函数
        const requireFromStart = createRequire(startPath);
        // 可选：清除缓存以支持热加载
        const resolved = requireFromStart.resolve(startPath);
        delete requireFromStart.cache[resolved];

        // 加载模块
        const launcherModule = requireFromStart(startPath);
        const launcher = launcherModule.default || launcherModule;

        if (!launcher || typeof launcher.start !== 'function') {
          this.logger.warn(`Invalid launcher in ${startPath}: missing start function.`);
          continue;
        }

        const info: ThirdPartyServerInfo = {
          id: entry.name,
          name:
            typeof launcher.name === 'string' && launcher.name.trim() !== ''
              ? launcher.name
              : entry.name,
        };
        this.launcherMap.set(info.id, launcher);
        servers.push(info);
        this.logger.log(`Registered third-party server: ${info.name} (${info.id})`);
      } catch (error) {
        this.logger.error(`Failed to load launcher from ${startPath}:`, error);
        // 继续扫描其他服务器
      }
    }

    return { servers };
  }

  getLauncherById(id: string): LspLauncher | null {
    return this.launcherMap.get(id) ?? null;
  }
}
