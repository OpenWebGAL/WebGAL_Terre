import {
  Connection,
  InitializeParams,
  InitializeResult,
  TextDocuments,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ScannerService } from './third-party/scanner.service';
import { LanguageServer, LanguageServerMode } from './types';

/**
 * 语言服务器的公共骨架：持有客户端连接、共享文档集合与第三方服务器扫描器，
 * 并注册两类实现都需要的控制请求。内建与第三方实现各自补充能力。
 */
export abstract class BaseLanguageServer implements LanguageServer {
  protected connection: Connection | null = null;
  protected basePath = '';
  protected readonly documents: TextDocuments<TextDocument>;
  protected readonly scanner = new ScannerService();

  protected constructor(documents: TextDocuments<TextDocument>) {
    this.documents = documents;
  }

  attach(connection: Connection): void {
    this.connection = connection;
    this.registerControlMethods(connection);
  }

  protected registerControlMethods(connection: Connection): void {
    connection.onRequest('textDocument/setBasePath', (params: { basePath: string }) => {
      if (params.basePath !== this.basePath) {
        this.basePath = params.basePath;
        this.onBasePathChanged(params.basePath);
      }
      return { success: true };
    });

    connection.onRequest('$/scanLanguageServers', async () => {
      try {
        const result = await this.scanner.scanServers();
        return { servers: result.servers };
      } catch (error) {
        this.logError(`Scanning language servers failed: ${error}`);
        return { servers: [] };
      }
    });

    connection.onRequest('$/getActiveLanguageServer', async () => ({
      mode: this.getMode(),
      activeId: this.getActiveId(),
    }));

    connection.onRequest('$/setActiveLanguageServer', async () =>
      this.handleSetActiveLanguageServer(),
    );
  }

  /** basePath 变化（切换项目）时触发的钩子，子类按需覆盖。 */
  protected onBasePathChanged(_basePath: string): void {}

  /** 处理切换语言服务器请求；内建实现允许切换，第三方代理需要重启连接。 */
  protected handleSetActiveLanguageServer(): { success: boolean; message?: string } {
    return { success: true };
  }

  abstract initialize(params: InitializeParams): Promise<InitializeResult>;
  abstract initialized(): void;
  abstract dispose(): Promise<void>;
  abstract getMode(): LanguageServerMode;
  abstract getActiveId(): string;

  protected logInfo(msg: string): void {
    console.info(msg);
    this.connection?.console.info(msg);
  }

  protected logError(msg: string): void {
    console.error(msg);
    this.connection?.console.error(msg);
  }
}
