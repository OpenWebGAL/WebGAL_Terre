import {
  ApplyWorkspaceEditParams,
  ApplyWorkspaceEditResult,
  Connection,
  createConnection,
  InitializeParams,
  InitializeResult,
  TextDocuments,
  WorkspaceEdit,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import * as fs from 'fs';
import { BaseLanguageServer } from './baseLanguageServer';
import { resolveWorkspaceUri, UriMapper } from './uriMapper';
import {
  FileWatcherRegistry,
  WatchedFileChange,
} from './fileWatcherRegistry';
import { WorkspaceEditApplier } from './workspaceEdit';
import { LspLauncher } from './third-party/types';

/** 本代理进程直接处理、不再转发给第三方 LSP 的请求。 */
const CONTROL_METHODS = [
  'textDocument/setBasePath',
  '$/scanLanguageServers',
  '$/getActiveLanguageServer',
  '$/setActiveLanguageServer',
];

/**
 * 第三方语言服务器代理：把浏览器客户端与第三方 LSP 进程桥接起来。
 *
 * 职责拆成三块：
 * - 协议转发（请求/通知、URI 双向映射）；
 * - 第三方 LSP 进程生命周期（启动/停止、初始化握手）；
 * - 能力代理（文件监视、workspace/fs、applyEdit、诊断回传）。
 */
export class ThirdPartyLanguageServer extends BaseLanguageServer {
  private readonly serverId: string;
  private readonly uriMapper = new UriMapper();
  private readonly fileWatchers: FileWatcherRegistry;
  private readonly workspaceEditApplier: WorkspaceEditApplier;

  private activeLauncher: LspLauncher | null = null;
  private activeConnection: Connection | null = null;
  private currentWorkspaceUri: string | null = null;

  constructor(documents: TextDocuments<TextDocument>, serverId: string) {
    super(documents);
    this.serverId = serverId;

    this.fileWatchers = new FileWatcherRegistry({
      getWorkspaceUri: () => this.currentWorkspaceUri,
      getBasePath: () => this.basePath,
      stripFileProtocol: (uri) => this.uriMapper.stripFileProtocol(uri),
      onEvent: (change: WatchedFileChange) =>
        this.notifyThirdParty('workspace/didChangeWatchedFiles', { changes: [change] }),
      logError: (msg) => this.logError(msg),
    });

    this.workspaceEditApplier = new WorkspaceEditApplier(
      (uri) => this.uriMapper.stripFileProtocol(uri),
      {
        sendDidChange: (uri, text, version) =>
          this.connection?.sendNotification('textDocument/didChange', {
            textDocument: { uri, version },
            contentChanges: [{ text }],
          }),
        sendDidChangeWatchedFiles: (changes) =>
          this.connection?.sendNotification('workspace/didChangeWatchedFiles', {
            changes,
          }),
        logError: (msg) => this.logError(msg),
      },
    );
  }

  // ========== 绑定客户端连接 ==========
  attach(connection: Connection): void {
    super.attach(connection);

    // 所有非控制类请求都转发给第三方 LSP。
    connection.onRequest((method: string, params: any, token: any) => {
      if (CONTROL_METHODS.includes(method)) return undefined;
      return this.tryForwardRequest(method, params, token);
    });

    this.registerDocumentEvents();
  }

  protected onBasePathChanged(basePath: string): void {
    this.updateWorkspaceFolders(basePath);
    this.notifyThirdParty('textDocument/setBasePath', { basePath });
    this.fileWatchers.reinitialize();
    this.fileWatchers.processPending();
  }

  protected handleSetActiveLanguageServer(): { success: boolean; message?: string } {
    return {
      success: false,
      message: 'Please restart the language client to switch language servers.',
    };
  }

  // ========== 生命周期 ==========
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    await this.stopThirdPartyServer();
    await this.startThirdPartyServer(params);
    if (!this.activeConnection) {
      throw new Error('Third-party language server failed to start');
    }
    return this.activeConnection.sendRequest('initialize', params);
  }

  initialized(): void {
    this.activeConnection?.sendNotification('initialized', {});
  }

  async dispose(): Promise<void> {
    await this.stopThirdPartyServer();
    await this.fileWatchers.dispose();
  }

  getMode() {
    return 'third-party' as const;
  }

  getActiveId() {
    return this.serverId;
  }

  // ========== 外部可调用的代理触发方法 ==========

  /** 后端文件保存后调用，通知第三方 LSP 文件已保存。 */
  async notifyDidSave(uri: string, text?: string): Promise<void> {
    const fileUri = this.uriMapper.toFileUri(uri);
    this.notifyThirdParty('textDocument/didSave', {
      textDocument: { uri: fileUri },
      text,
    });
  }

  /** 配置变更时调用，通知第三方 LSP 更新配置。 */
  updateConfiguration(settings: any): void {
    this.activeConnection?.sendNotification('workspace/didChangeConfiguration', {
      settings,
    });
  }

  /** 处理文件重命名：询问第三方 LSP 影响范围，落到文件系统后通知客户端。 */
  async requestWillRenameFiles(
    files: { oldUri: string; newUri: string }[],
  ): Promise<void> {
    if (!this.activeConnection) throw new Error('No active third-party LSP');

    const params = {
      files: files.map((f) => ({
        oldUri: this.uriMapper.toFileUri(f.oldUri),
        newUri: this.uriMapper.toFileUri(f.newUri),
      })),
    };

    const result = await this.activeConnection.sendRequest<WorkspaceEdit | null>(
      'workspace/willRenameFiles',
      params,
    );

    if (result) {
      await this.workspaceEditApplier.apply(result);
    }

    for (const { oldUri, newUri } of files) {
      const oldPath = this.uriMapper.stripFileProtocol(
        this.uriMapper.toFileUri(oldUri),
      );
      const newPath = this.uriMapper.stripFileProtocol(
        this.uriMapper.toFileUri(newUri),
      );
      try {
        await fs.promises.rename(oldPath, newPath);
      } catch (err) {
        this.logError(`Failed to rename ${oldPath} -> ${newPath}: ${err}`);
      }
    }

    this.connection?.sendNotification('workspace/didRenameFiles', {
      files: params.files,
    });
  }

  // ========== 第三方 LSP 进程管理 ==========
  private async startThirdPartyServer(params: InitializeParams): Promise<void> {
    await this.scanner.scanServers();
    const launcher = this.scanner.getLauncherById(this.serverId);
    if (!launcher) {
      throw new Error(`Third-party language server not found: ${this.serverId}`);
    }

    const { reader, writer } = await launcher.start();
    const thirdPartyConnection = createConnection(reader, writer);
    thirdPartyConnection.listen();
    this.attachThirdPartyEvents(thirdPartyConnection);

    this.activeLauncher = launcher;
    this.activeConnection = thirdPartyConnection;

    if (this.basePath) this.updateWorkspaceFolders(this.basePath);

    for (const document of this.documents.all()) {
      thirdPartyConnection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: this.uriMapper.toFileUri(document.uri),
          languageId: document.languageId,
          version: document.version,
          text: document.getText(),
        },
      });
    }
  }

  private async stopThirdPartyServer(): Promise<void> {
    if (this.activeLauncher) {
      try {
        await this.activeLauncher.stop?.();
      } catch {
        /* ignore */
      }
    }
    try {
      this.activeConnection?.dispose?.();
    } catch {
      /* ignore */
    }
    this.activeConnection = null;
    this.activeLauncher = null;
    this.currentWorkspaceUri = null;
    this.uriMapper.clear();
    await this.fileWatchers.dispose();
  }

  // ========== 文档事件转发 ==========
  private registerDocumentEvents(): void {
    this.documents.onDidClose((event) => {
      const fileUri = this.uriMapper.toFileUri(event.document.uri);
      this.notifyThirdParty('textDocument/didClose', {
        textDocument: { uri: fileUri },
      });
    });

    this.documents.onDidOpen((event) => {
      this.notifyThirdParty('textDocument/didOpen', {
        textDocument: {
          uri: this.uriMapper.toFileUri(event.document.uri),
          languageId: event.document.languageId,
          version: event.document.version,
          text: event.document.getText(),
        },
      });
    });

    this.documents.onDidChangeContent((change) => {
      this.notifyThirdParty('textDocument/didChange', {
        textDocument: {
          uri: this.uriMapper.toFileUri(change.document.uri),
          version: change.document.version,
        },
        contentChanges: [{ text: change.document.getText() }],
      });
    });

    this.documents.onDidSave((event) => {
      this.notifyThirdParty('textDocument/didSave', {
        textDocument: { uri: this.uriMapper.toFileUri(event.document.uri) },
      });
    });
  }

  // ========== 转发辅助 ==========
  private notifyThirdParty(method: string, params?: any): void {
    if (!this.activeConnection) return;
    if (params?.textDocument?.uri) {
      const fileUri = this.uriMapper.toFileUri(params.textDocument.uri);
      if (fileUri !== params.textDocument.uri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    this.activeConnection.sendNotification(method, params);
  }

  private async tryForwardRequest(method: string, params: any, token?: any) {
    if (!this.activeConnection) return undefined;
    if (params?.textDocument?.uri) {
      const fileUri = this.uriMapper.toFileUri(params.textDocument.uri);
      if (fileUri !== params.textDocument.uri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    return this.activeConnection.sendRequest(method, params, token);
  }

  // ========== 第三方 LSP 事件处理 ==========
  private attachThirdPartyEvents(activeConnection: Connection): void {
    // 注册/取消注册文件监视器（由后端 chokidar 代理）。
    activeConnection.onRequest('client/registerCapability', async (params: any) => {
      for (const reg of params?.registrations ?? []) {
        if (reg.method !== 'workspace/didChangeWatchedFiles') continue;

        const options = reg.registerOptions ?? {};
        const globPatterns = (options.watchers ?? [])
          .map(toGlobPattern)
          .filter((p: string | null): p is string => !!p);
        const finalPatterns = globPatterns.length ? globPatterns : ['**/*'];
        this.fileWatchers.register(reg.id, finalPatterns, options.kind);
      }
      return undefined;
    });

    activeConnection.onRequest('client/unregisterCapability', async (params: any) => {
      for (const unreg of params?.unregistrations ?? []) {
        this.fileWatchers.unregister(unreg.id);
      }
      return undefined;
    });

    // 文件系统访问代理。
    activeConnection.onRequest(async (method: string, params: any, token: any) => {
      if (!method.startsWith('workspace/fs/')) {
        return this.connection?.sendRequest(method, params, token);
      }
      try {
        const normalizedPath = this.uriMapper.stripFileProtocol(params.path);
        if (!normalizedPath) throw new Error('Empty path');

        switch (method) {
          case 'workspace/fs/readFile':
            return await fs.promises.readFile(normalizedPath, 'utf8');
          case 'workspace/fs/readDirectory': {
            const entries = await fs.promises.readdir(normalizedPath, {
              withFileTypes: true,
            });
            return entries.map((e) => ({
              name: e.name,
              isDirectory: e.isDirectory(),
            }));
          }
          case 'workspace/fs/exists':
            try {
              const s = await fs.promises.stat(normalizedPath);
              return { exists: true, isDirectory: s.isDirectory() };
            } catch {
              return { exists: false, isDirectory: false };
            }
          default:
            throw new Error(`Unsupported workspace/fs method: ${method}`);
        }
      } catch (err) {
        this.logError(`workspace/fs error: ${err}`);
        throw err;
      }
    });

    // 服务端执行 workspace/applyEdit。
    activeConnection.onRequest(
      'workspace/applyEdit',
      async (params: ApplyWorkspaceEditParams) => {
        try {
          const success = await this.workspaceEditApplier.apply(params.edit);
          return { applied: success } as ApplyWorkspaceEditResult;
        } catch (err) {
          this.logError(`workspace/applyEdit error: ${err}`);
          return { applied: false, failureReason: String(err) };
        }
      },
    );

    // 诊断回传：把 URI 还原成客户端能识别的形式。
    activeConnection.onNotification(
      'textDocument/publishDiagnostics',
      (params: any) => {
        const originalUri = this.uriMapper.toClientUri(params.uri);
        if (originalUri !== params.uri) (params as any).uri = originalUri;
        this.connection?.sendDiagnostics(params);
      },
    );

    // 常用请求/通知转发。
    activeConnection.onRequest('window/showMessageRequest', (p, t) =>
      this.connection?.sendRequest('window/showMessageRequest', p, t),
    );
    activeConnection.onRequest('window/showDocument', (p, t) =>
      this.connection?.sendRequest('window/showDocument', p, t),
    );
    activeConnection.onRequest('workspace/configuration', (p, t) =>
      this.connection?.sendRequest('workspace/configuration', p, t),
    );
    activeConnection.onNotification('window/showMessage', (p) =>
      this.connection?.sendNotification('window/showMessage', p),
    );
  }

  // ========== 工作区变更 ==========
  private updateWorkspaceFolders(newBasePath: string): void {
    try {
      const newWorkspaceUri = resolveWorkspaceUri(newBasePath);
      if (newWorkspaceUri === this.currentWorkspaceUri) return;

      if (this.activeConnection) {
        const added = newWorkspaceUri
          ? [{ uri: newWorkspaceUri, name: path.basename(newWorkspaceUri) }]
          : [];
        const removed = this.currentWorkspaceUri
          ? [
              {
                uri: this.currentWorkspaceUri,
                name: path.basename(this.currentWorkspaceUri),
              },
            ]
          : [];
        this.activeConnection.sendNotification('workspace/didChangeWorkspaceFolders', {
          event: { added, removed },
        });
      }
      this.currentWorkspaceUri = newWorkspaceUri;
    } catch (err) {
      this.logError(`updateWorkspaceFolders error: ${err}`);
    }
  }
}

function toGlobPattern(watcher: any): string | null {
  const globPattern = watcher?.globPattern;
  if (typeof globPattern === 'string') return globPattern;
  // LSP 允许 RelativePattern { baseUri, pattern }，这里只取 pattern，
  // 根目录已通过 chokidar 的 cwd 统一限定。
  if (globPattern && typeof globPattern.pattern === 'string') {
    return globPattern.pattern;
  }
  return null;
}
