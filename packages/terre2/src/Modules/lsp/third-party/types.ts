import { MessageReader, MessageWriter } from 'vscode-languageserver';

export interface LspLauncher {
  start(): Promise<{ reader: MessageReader; writer: MessageWriter }>;
  stop?(): Promise<void>;
}
