import {
  createConnection,
  TextDocuments,
  InitializeParams,
  MessageReader,
  MessageWriter,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createLanguageServer } from './languageServerFactory';

export function createWsConnection(
  reader: MessageReader,
  writer: MessageWriter,
) {
  const connection = createConnection(reader, writer);
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
  let currentLanguageServer = null;

  const logError = (msg: string) => {
    connection.console.error(`[LSP] ${msg}`);
  };

  connection.onInitialize(async (params: InitializeParams) => {
    const serverId = (params as any).initializationOptions?.languageServerId || 'native';
    currentLanguageServer = createLanguageServer(documents, { serverId });
    currentLanguageServer.attach(connection);

    try {
      return await currentLanguageServer.initialize(params);
    } catch (err: any) {
      logError(`Language server initialize failed (${serverId}): ${err}`);
      throw err;
    }
  });

  connection.onInitialized(() => {
    currentLanguageServer?.initialized();
  });

  connection.onRequest('$/getActiveLanguageServer', async () => {
    if (!currentLanguageServer) {
      return { mode: 'native', activeId: 'native' };
    }
    return {
      mode: currentLanguageServer.getMode(),
      activeId: currentLanguageServer.getActiveId(),
    };
  });

  connection.onRequest('$/setActiveLanguageServer', async () => {
    return {
      success: false,
      message: 'Language server switching is handled by the client via a new connection.',
    };
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
