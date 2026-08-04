import { Connection, TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NativeLanguageServer } from './nativeLanguageServer';
import { ThirdPartyLanguageServer } from './thirdPartyLanguageServer';

export interface LanguageServerOptions {
  serverId?: string;
}

export type LanguageServerMode = 'native' | 'third-party';

export interface LanguageServerWrapper {
  attach(connection: Connection): void;
  initialize(params: any): Promise<any>;
  initialized(): void;
  dispose(): Promise<void>;
  getMode(): LanguageServerMode;
  getActiveId(): string;
}

export const createLanguageServer = (
  documents: TextDocuments<TextDocument>,
  options: LanguageServerOptions,
): LanguageServerWrapper => {
  const serverId = options.serverId ?? 'native';
  if (!serverId || serverId === 'native') {
    return new NativeLanguageServer(documents);
  }
  return new ThirdPartyLanguageServer(documents, serverId);
};
