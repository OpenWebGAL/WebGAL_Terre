import {
  Connection,
  createConnection,
  InitializeParams,
  InitializeResult,
  TextDocuments,
  TextEdit,
  ApplyWorkspaceEditParams,
  ApplyWorkspaceEditResult,
  WorkspaceEdit,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { pathToFileURL } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { ScannerService } from './third-party/scanner.service';
import { UserDataService } from '../user-data/user-data.service';

export class ThirdPartyLanguageServer {
  private readonly documents: TextDocuments<TextDocument>;
  private readonly serverId: string;
  private readonly scanner = new ScannerService();

  private basePath = '';
  private currentWorkspaceUri: string | null = null;

  private uriMap = new Map<string, string>();
  private reverseUriMap = new Map<string, string>();

  private activeLauncher: any = null;
  private activeConnection: Connection | null = null;
  private connection: Connection | null = null;

  private fileWatchers = new Map<
    string,
    { watcher: chokidar.FSWatcher; globPatterns: string[]; kind?: number }
  >();

  private pendingWatcherRegistrations: {
    id: string;
    globPatterns: string[];
    kind?: number;
  }[] = [];

  constructor(documents: TextDocuments<TextDocument>, serverId: string) {
    this.documents = documents;
    this.serverId = serverId;
  }

  // ========== 绑定客户端连接 ==========
  attach(connection: Connection): void {
    this.connection = connection;

    connection.onRequest('textDocument/setBasePath', (params: { basePath: string }) => {
      const newBasePath = params.basePath;
      if (newBasePath !== this.basePath) {
        this.basePath = newBasePath;
        this.updateWorkspaceFolders(newBasePath);
        this.notifyThirdParty('textDocument/setBasePath', { basePath: newBasePath });
        this.reinitializeFileWatchers();
        this.processPendingRegistrations();
      }
      return { success: true };
    });

    connection.onRequest('$/scanLanguageServers', async () => {
      try {
        const result = await this.scanner.scanServers();
        return { servers: result.servers };
      } catch (error) {
        this.logError(`Scan failed: ${error}`);
        return { servers: [] };
      }
    });

    connection.onRequest('$/getActiveLanguageServer', async () => ({
      mode: 'third-party',
      activeId: this.serverId,
    }));

    connection.onRequest('$/setActiveLanguageServer', async () => ({
      success: false,
      message: 'Please restart the language client to switch language servers.',
    }));

    const controlMethods = [
      'textDocument/setBasePath',
      '$/scanLanguageServers',
      '$/getActiveLanguageServer',
      '$/setActiveLanguageServer',
    ];

    connection.onRequest((method: string, params: any, token: any) => {
      if (controlMethods.includes(method)) return undefined;
      return this.tryForwardRequest(method, params, token);
    });

    // 文档事件转发
    this.documents.onDidClose((event) => {
      const fileUri = this.getFileUri(event.document.uri);
      this.notifyThirdParty('textDocument/didClose', { textDocument: { uri: fileUri } });
    });

    this.documents.onDidOpen((event) => {
      const fileUri = this.getFileUri(event.document.uri);
      this.notifyThirdParty('textDocument/didOpen', {
        textDocument: {
          uri: fileUri,
          languageId: event.document.languageId,
          version: event.document.version,
          text: event.document.getText(),
        },
      });
    });

    this.documents.onDidChangeContent(async (change) => {
      const fileUri = this.getFileUri(change.document.uri);
      this.notifyThirdParty('textDocument/didChange', {
        textDocument: { uri: fileUri, version: change.document.version },
        contentChanges: [{ text: change.document.getText() }],
      });
    });

    this.documents.onDidSave((event) => {
      const fileUri = this.getFileUri(event.document.uri);
      this.notifyThirdParty('textDocument/didSave', {
        textDocument: { uri: fileUri },
      });
    });

    connection.onDidCloseTextDocument((params) => {
      const fileUri = this.getFileUri(params.textDocument.uri);
      this.notifyThirdParty('textDocument/didClose', { textDocument: { uri: fileUri } });
    });

    // 若第三方 LSP 已启动且工作区存在，立即同步
    if (this.activeConnection && this.currentWorkspaceUri) {
      this.activeConnection.sendNotification('workspace/didChangeWorkspaceFolders', {
        event: {
          added: [{ uri: this.currentWorkspaceUri, name: path.basename(this.currentWorkspaceUri) }],
          removed: [],
        },
      });
      this.reinitializeFileWatchers();
      this.processPendingRegistrations();
    }
  }

  // ========== 外部可调用的代理触发方法 ==========

  /**
   * 后端文件保存后调用，通知 LSP 文件已保存
   */
  async notifyDidSave(uri: string, text?: string): Promise<void> {
    const fileUri = this.getFileUri(uri);
    this.notifyThirdParty('textDocument/didSave', {
      textDocument: { uri: fileUri },
      text, // 可选，LSP 可能需要
    });
  }

  /**
   * 配置变更时调用，通知 LSP 更新配置
   */
  updateConfiguration(settings: any): void {
    this.activeConnection?.sendNotification('workspace/didChangeConfiguration', { settings });
  }

  /**
   * 处理文件重命名请求（由后端发起）
   * 向 LSP 询问重命名影响，执行实际文件操作与编辑
   */
  async requestWillRenameFiles(
    files: { oldUri: string; newUri: string }[]
  ): Promise<void> {
    if (!this.activeConnection) throw new Error('No active third-party LSP');

    const params = {
      files: files.map((f) => ({
        oldUri: this.getFileUri(f.oldUri),
        newUri: this.getFileUri(f.newUri),
      })),
    };

    const result = await this.activeConnection.sendRequest<WorkspaceEdit | null>(
      'workspace/willRenameFiles',
      params
    );

    if (result) {
      await this.applyWorkspaceEdit(result);
    }

    // 执行实际文件系统重命名
    for (const { oldUri, newUri } of files) {
      const oldPath = this.stripFileProtocol(this.getFileUri(oldUri));
      const newPath = this.stripFileProtocol(this.getFileUri(newUri));
      try {
        await fs.promises.rename(oldPath, newPath);
      } catch (err) {
        this.logError(`Failed to rename ${oldPath} -> ${newPath}: ${err}`);
      }
    }

    // 通知客户端重命名完成
    this.connection?.sendNotification('workspace/didRenameFiles', {
      files: params.files,
    });
  }

  // ========== 生命周期 ==========
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    await this.stopThirdPartyServer();
    await this.startThirdPartyServer(params);
    if (!this.activeConnection) throw new Error('Third-party language server failed to start');
    return this.activeConnection.sendRequest('initialize', params);
  }

  initialized(): void {
    this.activeConnection?.sendNotification('initialized', {});
  }

  async dispose(): Promise<void> {
    await this.stopThirdPartyServer();
    for (const [, reg] of this.fileWatchers) {
      try { await reg.watcher.close(); } catch { }
    }
    this.fileWatchers.clear();
    this.pendingWatcherRegistrations = [];
  }

  getMode() { return 'third-party' as const; }
  getActiveId() { return this.serverId; }

  // ========== 第三方 LSP 进程管理 ==========
  private async startThirdPartyServer(params: InitializeParams): Promise<void> {
    await this.scanner.scanServers();
    const launcher = this.scanner.getLauncherById(this.serverId);
    if (!launcher) throw new Error(`Third-party language server not found: ${this.serverId}`);

    const { reader, writer } = await launcher.start();
    const thirdPartyConnection = createConnection(reader, writer);
    thirdPartyConnection.listen();
    this.attachThirdPartyEvents(thirdPartyConnection);

    this.activeLauncher = launcher;
    this.activeConnection = thirdPartyConnection;

    if (this.basePath) this.updateWorkspaceFolders(this.basePath);

    for (const document of this.documents.all()) {
      const fileUri = this.getFileUri(document.uri);
      thirdPartyConnection.sendNotification('textDocument/didOpen', {
        textDocument: {
          uri: fileUri,
          languageId: document.languageId,
          version: document.version,
          text: document.getText(),
        },
      });
    }
  }

  private async stopThirdPartyServer(): Promise<void> {
    if (this.activeLauncher) {
      try { await this.activeLauncher.stop?.(); } catch { }
    }
    try { this.activeConnection?.dispose?.(); } catch { }
    this.activeConnection = null;
    this.activeLauncher = null;
    this.currentWorkspaceUri = null;
    this.uriMap.clear();
    this.reverseUriMap.clear();

    for (const [, reg] of this.fileWatchers) {
      try { await reg.watcher.close(); } catch { }
    }
    this.fileWatchers.clear();
    this.pendingWatcherRegistrations = [];
  }

  // ========== URI 转换 ==========
  private getFileUri(originalUri: string): string {
    let fileUri = this.uriMap.get(originalUri);
    if (!fileUri) {
      fileUri = this.normalizeUri(originalUri);
      if (fileUri !== originalUri) {
        this.uriMap.set(originalUri, fileUri);
        this.reverseUriMap.set(fileUri, originalUri);
      }
    }
    return fileUri;
  }

  private normalizeUri(originalUri: string): string {
    if (originalUri.startsWith('file://')) {
      const pathPart = originalUri.replace(/^file:\/\/\/?/, '');
      if (/^[A-Za-z]:[\\/]/i.test(pathPart) || pathPart.startsWith('/')) {
        try {
          const decoded = decodeURI(pathPart);
          if (/^[A-Za-z]:[\\/]/i.test(decoded) || decoded.startsWith('/')) return originalUri;
        } catch { }
      }
    }
    const state = UserDataService.getState();
    let relativePath = originalUri.replace(/^file:\/\/\/?/, '').replace(/^\/+/, '');
    if (originalUri.includes('://') && !originalUri.startsWith('file://')) {
      relativePath = originalUri.split('://')[1] || '';
    }
    if (!relativePath) return originalUri;
    let decodedRelativePath = relativePath;
    try { decodedRelativePath = decodeURI(relativePath); } catch { }
    const absolutePath = path.resolve(state.activeUserDataRoot, decodedRelativePath);
    return pathToFileURL(absolutePath).toString();
  }

  private stripFileProtocol(uriPath: string): string {
    if (!uriPath) return '';
    let p = uriPath.replace(/^file:\/\/\/?/, '');
    try { p = decodeURI(p); } catch { }
    if (process.platform === 'win32') {
      if (p.startsWith('/')) p = p.substring(1);
      p = p.replace(/\//g, '\\');
    }
    return p;
  }

  // ========== 转发辅助 ==========
  private notifyThirdParty(method: string, params?: any): void {
    if (!this.activeConnection) return;
    if (params?.textDocument?.uri) {
      const fileUri = this.getFileUri(params.textDocument.uri);
      if (fileUri !== params.textDocument.uri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    this.activeConnection.sendNotification(method, params);
  }

  private async tryForwardRequest(method: string, params: any, token?: any) {
    if (!this.activeConnection) return undefined;
    if (params?.textDocument?.uri) {
      const fileUri = this.getFileUri(params.textDocument.uri);
      if (fileUri !== params.textDocument.uri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    return this.activeConnection.sendRequest(method, params, token);
  }

  // ========== 第三方 LSP 事件处理 ==========
  private attachThirdPartyEvents(activeConnection: Connection) {
    // 注册/取消注册文件监视器
    activeConnection.onRequest('client/registerCapability', async (params: any) => {
      for (const reg of params?.registrations ?? []) {
        if (reg.method === 'workspace/didChangeWatchedFiles') {
          const options = reg.registerOptions ?? {};
          const globPatterns = (options.watchers ?? [])
            .map((w: any) => w.globPattern)
            .filter(Boolean);
          const finalPatterns = globPatterns.length ? globPatterns : ['**/*'];
          const kind = options.kind;

          const watcher = this.startFileWatcher(finalPatterns, kind);
          if (watcher) {
            this.fileWatchers.set(reg.id, { watcher, globPatterns: finalPatterns, kind });
          } else {
            this.pendingWatcherRegistrations.push({
              id: reg.id,
              globPatterns: finalPatterns,
              kind,
            });
          }
        }
      }
      return undefined;
    });

    activeConnection.onRequest('client/unregisterCapability', async (params: any) => {
      for (const unreg of params?.unregistrations ?? []) {
        const reg = this.fileWatchers.get(unreg.id);
        if (reg) {
          try { await reg.watcher.close(); } catch { }
          this.fileWatchers.delete(unreg.id);
        }
        this.pendingWatcherRegistrations = this.pendingWatcherRegistrations.filter(
          (r) => r.id !== unreg.id
        );
      }
      return undefined;
    });

    // 文件系统访问
    activeConnection.onRequest(async (method: string, params: any, token: any) => {
      if (method.startsWith('workspace/fs/')) {
        try {
          const normalizedPath = this.stripFileProtocol(params.path);
          if (!normalizedPath) throw new Error('Empty path');

          switch (method) {
            case 'workspace/fs/readFile':
              return await fs.promises.readFile(normalizedPath, 'utf8');
            case 'workspace/fs/readDirectory': {
              const entries = await fs.promises.readdir(normalizedPath, { withFileTypes: true });
              return entries.map((e) => ({ name: e.name, isDirectory: e.isDirectory() }));
            }
            case 'workspace/fs/exists':
              try {
                const s = await fs.promises.stat(normalizedPath);
                return { exists: true, isDirectory: s.isDirectory() };
              } catch { return { exists: false, isDirectory: false }; }
            default:
              throw new Error(`Unsupported workspace/fs method: ${method}`);
          }
        } catch (err) {
          this.logError(`workspace/fs error: ${err}`);
          throw err;
        }
      }
      return this.connection?.sendRequest(method, params, token);
    });

    // 服务端执行 workspace/applyEdit
    activeConnection.onRequest('workspace/applyEdit', async (params: ApplyWorkspaceEditParams) => {
      try {
        const success = await this.applyWorkspaceEdit(params.edit);
        return { applied: success } as ApplyWorkspaceEditResult;
      } catch (err) {
        this.logError(`workspace/applyEdit error: ${err}`);
        return { applied: false, failureReason: String(err) };
      }
    });

    // 诊断回传
    activeConnection.onNotification('textDocument/publishDiagnostics', (params: any) => {
      const originalUri = this.reverseUriMap.get(params.uri) || params.uri;
      if (originalUri !== params.uri) (params as any).uri = originalUri;
      this.connection?.sendDiagnostics(params);
    });

    // 常用请求转发
    activeConnection.onRequest('window/showMessageRequest', (p, t) => this.connection?.sendRequest('window/showMessageRequest', p, t));
    activeConnection.onRequest('window/showDocument', (p, t) => this.connection?.sendRequest('window/showDocument', p, t));
    activeConnection.onRequest('workspace/configuration', (p, t) => this.connection?.sendRequest('workspace/configuration', p, t));
    activeConnection.onNotification('window/showMessage', (p) => this.connection?.sendNotification('window/showMessage', p));
  }

  // ========== 服务端应用编辑 ==========
  private async applyWorkspaceEdit(edit: WorkspaceEdit): Promise<boolean> {
    if (!edit.changes && !edit.documentChanges) return false;

    // 处理简单变更 { uri: TextEdit[] }
    if (edit.changes) {
      for (const [uri, edits] of Object.entries(edit.changes)) {
        const filePath = this.stripFileProtocol(uri);
        try {
          let content = await fs.promises.readFile(filePath, 'utf8');
          content = this.applyTextEdits(content, edits);
          await fs.promises.writeFile(filePath, content, 'utf8');
          // 通知客户端文档变更
          this.connection?.sendNotification('textDocument/didChange', {
            textDocument: { uri, version: Date.now() }, // 简化版本
            contentChanges: [{ text: content }],
          });
        } catch (err) {
          this.logError(`Failed to apply edit on ${filePath}: ${err}`);
          return false;
        }
      }
    }

    // 处理 documentChanges（支持 TextDocumentEdit, CreateFile, RenameFile, DeleteFile）
    if (edit.documentChanges) {
      for (const change of edit.documentChanges) {
        if ('textDocument' in change) {
          // TextDocumentEdit
          const { uri, version } = change.textDocument;
          const filePath = this.stripFileProtocol(uri);
          try {
            let content = await fs.promises.readFile(filePath, 'utf8');
            content = this.applyTextEdits(content, change.edits);
            await fs.promises.writeFile(filePath, content, 'utf8');
            this.connection?.sendNotification('textDocument/didChange', {
              textDocument: { uri, version: (version ?? 0) + 1 },
              contentChanges: [{ text: content }],
            });
          } catch (err) {
            this.logError(`Failed to apply text edit on ${filePath}: ${err}`);
            return false;
          }
        } else if ('kind' in change) {
          // CreateFile, RenameFile, DeleteFile – 简化处理，直接执行
          const kind = (change as any).kind;
          const uri = (change as any).uri;
          const filePath = this.stripFileProtocol(uri);
          try {
            if (kind === 'create') {
              await fs.promises.writeFile(filePath, '', 'utf8');
            } else if (kind === 'delete') {
              await fs.promises.unlink(filePath);
            } else if (kind === 'rename') {
              const newUri = (change as any).newUri;
              const newPath = this.stripFileProtocol(newUri);
              await fs.promises.rename(filePath, newPath);
            }
            // 通知客户端相应变化（可通过 didChangeWatchedFiles）
            this.connection?.sendNotification('workspace/didChangeWatchedFiles', {
              changes: [{ uri, type: kind === 'delete' ? 3 : kind === 'create' ? 1 : 3 }],
            });
          } catch (err) {
            this.logError(`Failed to apply file operation ${kind} on ${filePath}: ${err}`);
            return false;
          }
        }
      }
    }

    return true;
  }

  private applyTextEdits(original: string, edits: TextEdit[]): string {
    // 简单实现：按位置从后往前应用，避免偏移
    let result = original;
    const sorted = [...edits].sort((a, b) => {
      const aStart = a.range.start.line * 100000 + a.range.start.character;
      const bStart = b.range.start.line * 100000 + b.range.start.character;
      return bStart - aStart;
    });

    for (const edit of sorted) {
      const startOffset = this.offsetAt(result, edit.range.start);
      const endOffset = this.offsetAt(result, edit.range.end);
      result = result.substring(0, startOffset) + edit.newText + result.substring(endOffset);
    }
    return result;
  }

  private offsetAt(text: string, position: { line: number; character: number }): number {
    const lines = text.split('\n');
    let offset = 0;
    for (let i = 0; i < position.line && i < lines.length; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }
    return offset + position.character;
  }

  // ========== 文件监视器 ==========
  private startFileWatcher(globPatterns: string[], kind?: number): chokidar.FSWatcher | null {
    if (!chokidar?.watch) return null;

    let workspaceRoot = this.currentWorkspaceUri;
    if (!workspaceRoot && this.basePath) {
      const state = UserDataService.getState();
      const absolutePath = path.resolve(state.activeUserDataRoot, this.basePath);
      workspaceRoot = pathToFileURL(absolutePath).toString();
    }
    if (!workspaceRoot) return null;

    const rootPath = this.stripFileProtocol(workspaceRoot);
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

      const onChange = (eventType: 'add' | 'change' | 'unlink', filePath: string) => {
        if (kind !== undefined) {
          const eventKind = eventType === 'add' ? 1 : eventType === 'change' ? 2 : 4;
          if ((kind & eventKind) === 0) return;
        }
        const absolutePath = path.join(rootPath, filePath);
        const fileUri = pathToFileURL(absolutePath).toString();
        const type = eventType === 'add' ? 1 : eventType === 'change' ? 2 : 3;
        this.notifyThirdParty('workspace/didChangeWatchedFiles', {
          changes: [{ uri: fileUri, type }],
        });
      };

      watcher.on('add', (f) => onChange('add', f));
      watcher.on('change', (f) => onChange('change', f));
      watcher.on('unlink', (f) => onChange('unlink', f));
      watcher.on('error', (err) => this.logError(`Watcher error: ${err}`));

      return watcher;
    } catch (err) {
      this.logError(`Failed to start file watcher: ${err}`);
      return null;
    }
  }

  private async reinitializeFileWatchers(): Promise<void> {
    if (this.fileWatchers.size === 0) return;

    const registrations = Array.from(this.fileWatchers.entries()).map(([id, reg]) => ({
      id,
      globPatterns: reg.globPatterns,
      kind: reg.kind,
    }));
    for (const [, reg] of this.fileWatchers) {
      try { await reg.watcher.close(); } catch { }
    }
    this.fileWatchers.clear();

    for (const reg of registrations) {
      const watcher = this.startFileWatcher(reg.globPatterns, reg.kind);
      if (watcher) {
        this.fileWatchers.set(reg.id, { watcher, globPatterns: reg.globPatterns, kind: reg.kind });
      }
    }
  }

  private processPendingRegistrations(): void {
    const remaining: typeof this.pendingWatcherRegistrations = [];
    for (const reg of this.pendingWatcherRegistrations) {
      const watcher = this.startFileWatcher(reg.globPatterns, reg.kind);
      if (watcher) {
        this.fileWatchers.set(reg.id, { watcher, globPatterns: reg.globPatterns, kind: reg.kind });
      } else {
        remaining.push(reg);
      }
    }
    this.pendingWatcherRegistrations = remaining;
  }

  // ========== 工作区变更 ==========
  private updateWorkspaceFolders(newBasePath: string): void {
    try {
      const state = UserDataService.getState();
      let newWorkspaceUri: string | null = null;
      if (newBasePath?.trim()) {
        const absolutePath = path.resolve(state.activeUserDataRoot, newBasePath);
        newWorkspaceUri = pathToFileURL(absolutePath).toString();
      }
      if (newWorkspaceUri === this.currentWorkspaceUri) return;

      if (this.activeConnection) {
        const added = newWorkspaceUri
          ? [{ uri: newWorkspaceUri, name: path.basename(newWorkspaceUri) }]
          : [];
        const removed = this.currentWorkspaceUri
          ? [{ uri: this.currentWorkspaceUri, name: path.basename(this.currentWorkspaceUri) }]
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

  // ========== 日志 ==========
  private logInfo(msg: string) {
    console.info(msg);
    this.connection?.console.info(msg);
  }

  private logError(msg: string) {
    console.error(msg);
    this.connection?.console.error(msg);
  }
}
