import { MessageReader, MessageWriter } from 'vscode-languageserver';

export interface LspLauncher {
  /** 可选的展示名称；缺省时使用服务器目录名。 */
  name?: string;
  start(): Promise<{ reader: MessageReader; writer: MessageWriter }>;
  stop?(): Promise<void>;
}
