// trash 是纯 ESM 依赖，jest(CommonJS) 无法解析，测试里用桩替换即可。
jest.mock('trash', () => ({ __esModule: true, default: jest.fn() }));

import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { createLanguageServer } from './languageServerFactory';
import { NativeLanguageServer } from './nativeLanguageServer';
import { ThirdPartyLanguageServer } from './thirdPartyLanguageServer';

describe('createLanguageServer', () => {
  const documents = new TextDocuments(TextDocument);

  it('returns the native server for "native"', () => {
    expect(createLanguageServer(documents, { serverId: 'native' })).toBeInstanceOf(
      NativeLanguageServer,
    );
  });

  it('returns the native server when no id is given', () => {
    expect(createLanguageServer(documents, {})).toBeInstanceOf(NativeLanguageServer);
  });

  it('returns the third-party proxy for any other id', () => {
    expect(createLanguageServer(documents, { serverId: 'my-lsp' })).toBeInstanceOf(
      ThirdPartyLanguageServer,
    );
  });
});
