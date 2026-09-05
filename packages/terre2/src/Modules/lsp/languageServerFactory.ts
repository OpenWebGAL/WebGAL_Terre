import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NativeLanguageServer } from './nativeLanguageServer';
import { ThirdPartyLanguageServer } from './thirdPartyLanguageServer';
import { LanguageServer, LanguageServerMode } from './types';

export interface LanguageServerOptions {
  serverId?: string;
}

export type { LanguageServer, LanguageServerMode };

export const createLanguageServer = (
  documents: TextDocuments<TextDocument>,
  options: LanguageServerOptions,
): LanguageServer => {
  const serverId = options.serverId ?? 'native';
  if (!serverId || serverId === 'native') {
    return new NativeLanguageServer(documents);
  }
  return new ThirdPartyLanguageServer(documents, serverId);
};
