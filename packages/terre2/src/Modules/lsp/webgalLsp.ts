import {
  createConnection,
  InitializeParams,
  MessageReader,
  MessageWriter,
  TextDocuments,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createLanguageServer } from './languageServerFactory';
import { LanguageServer } from './types';

/**
 * 为每个 WebSocket 连接建立一条 LSP 会话。
 *
 * 控制类请求（`$/scanLanguageServers`、`$/getActiveLanguageServer`、
 * `$/setActiveLanguageServer`、`textDocument/setBasePath`）由具体语言服务器
 * 在 attach 时统一注册，这里只负责会话骨架与生命周期。
 */
export function createWsConnection(
  reader: MessageReader,
  writer: MessageWriter,
): void {
  const connection = createConnection(reader, writer);
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  let currentLanguageServer: LanguageServer | null = null;

  connection.onInitialize(async (params: InitializeParams) => {
    const serverId =
      (params as any).initializationOptions?.languageServerId || 'native';
    currentLanguageServer = createLanguageServer(documents, { serverId });
    currentLanguageServer.attach(connection);

    try {
      return await currentLanguageServer.initialize(params);
    } catch (err: any) {
      connection.console.error(
        `[LSP] Language server initialize failed (${serverId}): ${err}`,
      );
      throw err;
    }
  });

  connection.onInitialized(() => {
    currentLanguageServer?.initialized();
  });

  connection.onShutdown(async () => {
    await currentLanguageServer?.dispose();
  });

  connection.onExit(async () => {
    await currentLanguageServer?.dispose();
  });

  documents.listen(connection);
  connection.listen();
}
