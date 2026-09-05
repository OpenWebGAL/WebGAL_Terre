// trash 是纯 ESM 依赖，jest(CommonJS) 无法解析，测试里用桩替换即可。
jest.mock('trash', () => ({ __esModule: true, default: jest.fn() }));

import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { NativeLanguageServer } from './nativeLanguageServer';

function makeFakeConnection() {
  const handlers: Record<string, Function> = {};
  return {
    handlers,
    onRequest: (methodOrHandler: any, handler?: any) => {
      if (typeof methodOrHandler === 'string') {
        handlers[methodOrHandler] = handler;
      }
    },
    onNotification: jest.fn(),
    onCompletion: jest.fn(),
    onCompletionResolve: jest.fn(),
    onDidChangeConfiguration: jest.fn(),
    onDidCloseTextDocument: jest.fn(),
    sendRequest: jest.fn(),
    sendNotification: jest.fn(),
    sendDiagnostics: jest.fn(),
    console: { info: jest.fn(), error: jest.fn(), log: jest.fn() },
  };
}

describe('NativeLanguageServer', () => {
  const documents = new TextDocuments(TextDocument);
  const server = new NativeLanguageServer(documents);

  it('reports native mode and id', () => {
    expect(server.getMode()).toBe('native');
    expect(server.getActiveId()).toBe('native');
  });

  it('returns completion and semantic token capabilities', async () => {
    const result = await server.initialize({ capabilities: {} } as any);

    expect(result.capabilities.textDocumentSync).toBe(1);
    expect(result.capabilities.completionProvider).toBeDefined();
    expect(result.capabilities.semanticTokensProvider).toBeDefined();
  });

  it('advertises workspace folders only when the client supports them', async () => {
    const withoutWorkspace = await server.initialize({ capabilities: {} } as any);
    expect(withoutWorkspace.capabilities.workspace).toBeUndefined();

    const withWorkspace = await server.initialize({
      capabilities: { workspace: { workspaceFolders: {} } },
    } as any);
    expect(withWorkspace.capabilities.workspace).toEqual({
      workspaceFolders: { supported: true },
    });
  });

  it('registers the shared control requests on attach', () => {
    const connection = makeFakeConnection();
    server.attach(connection as any);

    expect(connection.handlers['$/getActiveLanguageServer']()).resolves.toEqual({
      mode: 'native',
      activeId: 'native',
    });
  });
});
