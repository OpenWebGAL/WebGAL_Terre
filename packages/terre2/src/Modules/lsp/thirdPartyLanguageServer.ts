import {
  Connection,
  createConnection,
  InitializeParams,
  InitializeResult,
  SemanticTokensParams,
  CompletionParams,
  CompletionItem,
  TextDocuments,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { pathToFileURL } from 'url';
import * as path from 'path';
import * as fs from 'fs';
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

  constructor(documents: TextDocuments<TextDocument>, serverId: string) {
    this.documents = documents;
    this.serverId = serverId;
  }

  attach(connection: Connection): void {
    this.connection = connection;

    // ----- 控制类请求（由本服务器直接处理，不转发）-----
    connection.onRequest('textDocument/setBasePath', (params: { basePath: string }) => {
      const newBasePath = params.basePath;
      if (newBasePath !== this.basePath) {
        this.basePath = newBasePath;
        this.updateWorkspaceFolders(newBasePath);
        this.notifyThirdParty('textDocument/setBasePath', { basePath: newBasePath });
      }
      return { success: true };
    });

    connection.onRequest('$/scanLanguageServers', async () => {
      try {
        const result = await this.scanner.scanServers();
        return { servers: result.servers };
      } catch (error) {
        connection.console.error(`Scanning language servers failed: ${error}`);
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

    // ----- 通用转发：所有非控制类请求全部转发给第三方 LSP -----
    const controlMethods = [
      'textDocument/setBasePath',
      '$/scanLanguageServers',
      '$/getActiveLanguageServer',
      '$/setActiveLanguageServer',
    ];

    connection.onRequest((method: string, params: any, token: any) => {
      // 如果是控制类方法，不转发
      if (controlMethods.includes(method)) {
        return undefined;
      }
      // 打印日志便于调试
      return this.tryForwardRequest(method, params, token);
    });

    // ----- 文档事件（通知）处理 -----
    this.documents.onDidClose((event) => {
      const fileUri = this.getFileUri(event.document.uri);
      this.notifyThirdParty('textDocument/didClose', {
        textDocument: { uri: fileUri },
      });
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
        textDocument: {
          uri: fileUri,
          version: change.document.version,
        },
        contentChanges: [{ text: change.document.getText() }],
      });
    });

    connection.onDidCloseTextDocument((params) => {
      const fileUri = this.getFileUri(params.textDocument.uri);
      this.notifyThirdParty('textDocument/didClose', {
        textDocument: { uri: fileUri },
      });
    });
  }

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    await this.stopThirdPartyServer();
    await this.startThirdPartyServer(params);
    if (!this.activeConnection) {
      throw new Error('Third-party language server failed to start');
    }
    return this.activeConnection.sendRequest('initialize', params);
  }

  initialized(): void {
    if (!this.activeConnection) {
      return;
    }
    this.activeConnection.sendNotification('initialized', {});
  }

  async dispose(): Promise<void> {
    await this.stopThirdPartyServer();
  }

  getMode() {
    return 'third-party' as const;
  }

  getActiveId() {
    return this.serverId;
  }

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

    if (this.basePath) {
      this.updateWorkspaceFolders(this.basePath);
    }

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
      try {
        await this.activeLauncher.stop?.();
      } catch {
        // ignore
      }
    }
    try {
      this.activeConnection?.dispose?.();
    } catch {
      // ignore
    }
    this.activeConnection = null;
    this.activeLauncher = null;
    this.currentWorkspaceUri = null;
    this.uriMap.clear();
    this.reverseUriMap.clear();
  }

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
          if (/^[A-Za-z]:[\\/]/i.test(decoded) || decoded.startsWith('/')) {
            return originalUri;
          }
        } catch { }
      }
    }

    const state = UserDataService.getState();
    let relativePath = originalUri.replace(/^file:\/\/\/?/, '').replace(/^\/+/, '');
    if (originalUri.includes('://') && !originalUri.startsWith('file://')) {
      relativePath = originalUri.split('://')[1] || '';
    }
    if (!relativePath) {
      return originalUri;
    }
    let decodedRelativePath = relativePath;
    try {
      decodedRelativePath = decodeURI(relativePath);
    } catch { }
    const absolutePath = path.resolve(state.activeUserDataRoot, decodedRelativePath);
    const fileUri = pathToFileURL(absolutePath).toString();
    return fileUri;
  };

  private stripFileProtocol(uriPath: string): string {
    if (!uriPath) return '';
    let pathWithoutScheme = uriPath.replace(/^file:\/\/\/?/, '');
    try {
      pathWithoutScheme = decodeURI(pathWithoutScheme);
    } catch {
      // ignore
    }
    if (process.platform === 'win32') {
      // 移除开头的 /（如果有）
      if (pathWithoutScheme.startsWith('/')) {
        pathWithoutScheme = pathWithoutScheme.substring(1);
      }
      pathWithoutScheme = pathWithoutScheme.replace(/\//g, '\\');
    }
    return pathWithoutScheme;
  }

  private notifyThirdParty(method: string, params?: any): void {
    if (!this.activeConnection) return;
    if (params && params.textDocument && params.textDocument.uri) {
      const originalUri = params.textDocument.uri;
      const fileUri = this.getFileUri(originalUri);
      if (fileUri !== originalUri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    this.activeConnection.sendNotification(method, params);
  }

  private async tryForwardRequest(method: string, params: any, token?: any) {
    if (!this.activeConnection) return undefined;
    if (params && params.textDocument && params.textDocument.uri) {
      const originalUri = params.textDocument.uri;
      const fileUri = this.getFileUri(originalUri);
      if (fileUri !== originalUri) {
        (params.textDocument as any).uri = fileUri;
      }
    }
    return this.activeConnection.sendRequest(method, params, token);
  }

  private attachThirdPartyEvents(activeConnection: Connection) {
    activeConnection.onRequest(async (method: string, params: any, token: any) => {
      if (method.startsWith('workspace/fs/')) {
        try {
          const rawPath = params.path;
          const normalizedPath = this.stripFileProtocol(rawPath);
          if (!normalizedPath) {
            throw new Error('Empty path after stripping file protocol');
          }
          switch (method) {
            case 'workspace/fs/readFile':
              return await fs.promises.readFile(normalizedPath, 'utf8');
            case 'workspace/fs/readDirectory': {
              const entries = await fs.promises.readdir(normalizedPath, { withFileTypes: true });
              return entries.map((entry) => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
              }));
            }
            case 'workspace/fs/exists': {
              try {
                const s = await fs.promises.stat(normalizedPath);
                return { exists: true, isDirectory: s.isDirectory() };
              } catch {
                return { exists: false, isDirectory: false };
              }
            }
            default:
              throw new Error(`Unsupported workspace/fs method: ${method}`);
          }
        } catch (err) {
          this.connection?.console.error(`workspace/fs error: ${err}`);
          throw err;
        }
      }
      return this.connection?.sendRequest(method, params, token);
    });

    activeConnection.onNotification('textDocument/publishDiagnostics', (params: any) => {
      const fileUri = params.uri;
      const originalUri = this.reverseUriMap.get(fileUri) || fileUri;
      if (originalUri !== fileUri) {
        (params as any).uri = originalUri;
      }
      this.connection?.sendDiagnostics(params);
    });

    activeConnection.onRequest('window/showMessageRequest', (params: any, token: any) => {
      return this.connection?.sendRequest('window/showMessageRequest', params, token);
    });
    activeConnection.onRequest('window/showDocument', (params: any, token: any) => {
      return this.connection?.sendRequest('window/showDocument', params, token);
    });
    activeConnection.onRequest('workspace/applyEdit', (params: any, token: any) => {
      return this.connection?.sendRequest('workspace/applyEdit', params, token);
    });
    activeConnection.onRequest('workspace/configuration', (params: any, token: any) => {
      return this.connection?.sendRequest('workspace/configuration', params, token);
    });
    activeConnection.onNotification('window/showMessage', (params: any) => {
      this.connection?.sendNotification('window/showMessage', params);
    });
  }

  private updateWorkspaceFolders(newBasePath: string): void {
    if (!this.activeConnection) return;
    try {
      const state = UserDataService.getState();
      let newWorkspaceUri: string | null = null;
      if (newBasePath && newBasePath.trim() !== '') {
        const absolutePath = path.resolve(state.activeUserDataRoot, newBasePath);
        newWorkspaceUri = pathToFileURL(absolutePath).toString();
      }
      if (newWorkspaceUri === this.currentWorkspaceUri) return;
      const added: any[] = [];
      const removed: any[] = [];
      if (newWorkspaceUri) {
        added.push({ uri: newWorkspaceUri, name: path.basename(newWorkspaceUri) });
      }
      if (this.currentWorkspaceUri) {
        removed.push({ uri: this.currentWorkspaceUri, name: path.basename(this.currentWorkspaceUri) });
      }
      this.activeConnection.sendNotification('workspace/didChangeWorkspaceFolders', {
        event: { added, removed },
      });
      this.currentWorkspaceUri = newWorkspaceUri;
    } catch (err) {
      this.connection?.console.error(`updateWorkspaceFolders error: ${err}`);
    }
  }
}
