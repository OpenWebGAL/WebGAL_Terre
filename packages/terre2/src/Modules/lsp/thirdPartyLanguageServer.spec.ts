import * as os from 'os';
import * as path from 'path';
import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ThirdPartyLanguageServer } from './thirdPartyLanguageServer';
import { ScannerService } from './third-party/scanner.service';
import { UserDataService } from '../user-data/user-data.service';

jest.mock('vscode-languageserver/node', () => {
  const actual = jest.requireActual('vscode-languageserver/node');
  return { ...actual, createConnection: jest.fn() };
});

import { createConnection } from 'vscode-languageserver/node';

const createConnectionMock = createConnection as jest.Mock;

function makeFakeConnection() {
  const handlers: Record<string, Function> = {};
  let star: Function | null = null;
  return {
    handlers,
    getStar: () => star,
    onRequest: (methodOrHandler: any, handler?: any) => {
      if (typeof methodOrHandler === 'string') {
        handlers[methodOrHandler] = handler;
      } else {
        star = methodOrHandler;
      }
    },
    onNotification: jest.fn(),
    sendRequest: jest.fn(),
    sendNotification: jest.fn(),
    sendDiagnostics: jest.fn(),
    console: { info: jest.fn(), error: jest.fn(), log: jest.fn() },
  };
}

const thirdPartyConnection = {
  listen: jest.fn(),
  sendRequest: jest.fn().mockResolvedValue({ capabilities: { textDocumentSync: 1 } }),
  sendNotification: jest.fn(),
  onRequest: jest.fn(),
  onNotification: jest.fn(),
  sendDiagnostics: jest.fn(),
  dispose: jest.fn(),
  console: { info: jest.fn(), error: jest.fn(), log: jest.fn() },
};

const launcher = {
  name: 'Test LSP',
  start: jest.fn().mockResolvedValue({ reader: { onClose: jest.fn() }, writer: {} }),
  stop: jest.fn().mockResolvedValue(undefined),
};

describe('ThirdPartyLanguageServer', () => {
  const documents = new TextDocuments(TextDocument);

  beforeAll(() => {
    (UserDataService as any).state = {
      activeUserDataRoot: path.join(os.tmpdir(), 'webgal-tp-lsp-spec'),
    };
  });

  afterAll(() => {
    (UserDataService as any).state = null;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    createConnectionMock.mockReturnValue(thirdPartyConnection);
    jest.spyOn(ScannerService.prototype, 'scanServers').mockResolvedValue({
      servers: [{ id: 'test', name: 'Test LSP' }],
    });
    jest.spyOn(ScannerService.prototype, 'getLauncherById').mockReturnValue(launcher as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports third-party mode and id', () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    expect(server.getMode()).toBe('third-party');
    expect(server.getActiveId()).toBe('test');
  });

  it('forwards initialize to the third-party server', async () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    const params = { capabilities: {}, initializationOptions: { languageServerId: 'test' } } as any;

    const result = await server.initialize(params);

    expect(launcher.start).toHaveBeenCalled();
    const started = await launcher.start.mock.results[0].value;
    expect(createConnectionMock).toHaveBeenCalledWith(started.reader, started.writer);
    expect(thirdPartyConnection.sendRequest).toHaveBeenCalledWith('initialize', params);
    expect(result).toEqual({ capabilities: { textDocumentSync: 1 } });
  });

  it('forwards non-control requests through the proxy', async () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    await server.initialize({ capabilities: {} } as any);

    const connection = makeFakeConnection();
    server.attach(connection as any);

    await connection.getStar()!('textDocument/hover', {
      textDocument: { uri: 'games/demo/game/scene.txt' },
    }, undefined);

    expect(thirdPartyConnection.sendRequest).toHaveBeenCalledWith(
      'textDocument/hover',
      expect.objectContaining({ textDocument: { uri: expect.stringContaining('file:') } }),
      undefined,
    );
  });

  it('answers control requests without forwarding', () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    const connection = makeFakeConnection();
    server.attach(connection as any);

    expect(connection.handlers['$/getActiveLanguageServer']()).resolves.toEqual({
      mode: 'third-party',
      activeId: 'test',
    });
    expect(connection.handlers['$/setActiveLanguageServer']()).resolves.toEqual({
      success: false,
      message: expect.any(String),
    });
  });

  it('syncs the workspace when the client sets the base path', async () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    await server.initialize({ capabilities: {} } as any);

    const connection = makeFakeConnection();
    server.attach(connection as any);

    const setBasePath = connection.handlers['textDocument/setBasePath'];
    expect(setBasePath({ basePath: 'games/demo/game/' })).toEqual({ success: true });

    expect(thirdPartyConnection.sendNotification).toHaveBeenCalledWith(
      'textDocument/setBasePath',
      { basePath: 'games/demo/game/' },
    );
    expect(thirdPartyConnection.sendNotification).toHaveBeenCalledWith(
      'workspace/didChangeWorkspaceFolders',
      expect.objectContaining({ event: expect.any(Object) }),
    );
  });

  it('stops the launcher on dispose', async () => {
    const server = new ThirdPartyLanguageServer(documents, 'test');
    await server.initialize({ capabilities: {} } as any);

    await server.dispose();

    expect(launcher.stop).toHaveBeenCalled();
    expect(thirdPartyConnection.dispose).toHaveBeenCalled();
  });
});
