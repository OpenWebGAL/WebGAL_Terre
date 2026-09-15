import * as path from 'path';
import * as chokidar from 'chokidar';
import { pathToFileURL } from 'url';
import { resolveWorkspaceUri } from './uriMapper';

export interface WatchedFileChange {
  uri: string;
  type: number;
}

export interface FileWatcherRegistryOptions {
  /** 当前工作区 URI；未建立时返回 null。 */
  getWorkspaceUri: () => string | null;
  /** 客户端下发的 basePath，作为工作区 URI 的回退来源。 */
  getBasePath: () => string;
  stripFileProtocol: (uri: string) => string;
  /** 检测到文件变化时回调（通常转发 `workspace/didChangeWatchedFiles`）。 */
  onEvent: (change: WatchedFileChange) => void;
  logError: (msg: string) => void;
}

interface ActiveWatcher {
  watcher: chokidar.FSWatcher;
  globPatterns: string[];
  kind?: number;
}

interface PendingRegistration {
  id: string;
  globPatterns: string[];
  kind?: number;
}

/**
 * 维护第三方 LSP 通过 `client/registerCapability` 注册的文件监视器。
 *
 * 浏览器里的 Monaco 客户端无法自己监视文件系统，因此由后端用 chokidar 代理：
 * 第三方 LSP 注册 `workspace/didChangeWatchedFiles` 时，后端按 glob 监视工作区，
 * 把变化再以通知形式推回第三方 LSP。
 */
export class FileWatcherRegistry {
  private readonly watchers = new Map<string, ActiveWatcher>();
  private pending: PendingRegistration[] = [];
  private readonly options: FileWatcherRegistryOptions;

  constructor(options: FileWatcherRegistryOptions) {
    this.options = options;
  }

  register(id: string, globPatterns: string[], kind?: number): void {
    const watcher = this.startWatcher(globPatterns, kind);
    if (watcher) {
      this.watchers.set(id, { watcher, globPatterns, kind });
    } else {
      // 工作区还没建立时先记下来，等工作区就绪再补启动。
      this.pending.push({ id, globPatterns, kind });
    }
  }

  unregister(id: string): void {
    const reg = this.watchers.get(id);
    if (reg) {
      reg.watcher.close().catch(() => undefined);
      this.watchers.delete(id);
    }
    this.pending = this.pending.filter((r) => r.id !== id);
  }

  /** 工作区变化后，用新的根路径重建所有已注册的监视器。 */
  reinitialize(): void {
    if (this.watchers.size === 0) return;

    const registrations = Array.from(this.watchers.entries()).map(([id, reg]) => ({
      id,
      globPatterns: reg.globPatterns,
      kind: reg.kind,
    }));
    for (const [, reg] of this.watchers) {
      reg.watcher.close().catch(() => undefined);
    }
    this.watchers.clear();

    for (const reg of registrations) {
      this.register(reg.id, reg.globPatterns, reg.kind);
    }
  }

  /** 尝试启动所有因工作区缺失而积压的注册。 */
  processPending(): void {
    const remaining: PendingRegistration[] = [];
    for (const reg of this.pending) {
      const watcher = this.startWatcher(reg.globPatterns, reg.kind);
      if (watcher) {
        this.watchers.set(reg.id, {
          watcher,
          globPatterns: reg.globPatterns,
          kind: reg.kind,
        });
      } else {
        remaining.push(reg);
      }
    }
    this.pending = remaining;
  }

  async dispose(): Promise<void> {
    for (const [, reg] of this.watchers) {
      try {
        await reg.watcher.close();
      } catch {
        /* ignore */
      }
    }
    this.watchers.clear();
    this.pending = [];
  }

  private startWatcher(
    globPatterns: string[],
    kind?: number,
  ): chokidar.FSWatcher | null {
    const workspaceUri =
      this.options.getWorkspaceUri() ?? resolveWorkspaceUri(this.options.getBasePath());
    if (!workspaceUri) return null;

    const rootPath = this.options.stripFileProtocol(workspaceUri);
    if (!rootPath) return null;

    try {
      const watcher = chokidar.watch(globPatterns, {
        cwd: rootPath,
        ignoreInitial: true,
        persistent: true,
        ignorePermissionErrors: true,
        usePolling: true,
        interval: 300,
      });

      const emit = (eventType: 'add' | 'change' | 'unlink', filePath: string) => {
        if (kind !== undefined) {
          // WatchKind: Create = 1, Change = 2, Delete = 4
          const eventKind = eventType === 'add' ? 1 : eventType === 'change' ? 2 : 4;
          if ((kind & eventKind) === 0) return;
        }
        const absolutePath = path.join(rootPath, filePath);
        const uri = pathToFileURL(absolutePath).toString();
        // FileChangeType: Created = 1, Changed = 2, Deleted = 3
        const type = eventType === 'add' ? 1 : eventType === 'change' ? 2 : 3;
        this.options.onEvent({ uri, type });
      };

      watcher.on('add', (f) => emit('add', f));
      watcher.on('change', (f) => emit('change', f));
      watcher.on('unlink', (f) => emit('unlink', f));
      watcher.on('error', (err) => this.options.logError(`Watcher error: ${err}`));

      return watcher;
    } catch (err) {
      this.options.logError(`Failed to start file watcher: ${err}`);
      return null;
    }
  }
}
