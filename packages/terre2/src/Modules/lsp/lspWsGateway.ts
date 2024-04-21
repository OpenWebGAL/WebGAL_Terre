import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
} from '../../../terre-custom-libs/vscode-ws-jsonrpc-webgal/build/cjs';
import { createWsConnection } from './webgalLsp';

function toIWebSocket(ws: WebSocket): any {
  return {
    send: (content) => {
      //console.log(`contents = ${content}`);
      ws.send(content);
    },
    onMessage: (cb) =>
      (ws.onmessage = (event) => {
        console.log(event.data);
        cb(event.data);
      }),
    onError: (cb) =>
      (ws.onerror = (event) => {
        if ('message' in event) {
          cb((event as any).message);
        }
      }),
    onClose: (cb) => (ws.onclose = (event) => cb(event.code, event.reason)),
    dispose: () => ws.close(),
  };
}

@WebSocketGateway({
  path: '/api/lsp2',
  transports: 'websocket',
})
export class LspGateway {
  @WebSocketServer()
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    this.listenForMessages();
  }

  private pipeSocket(ws) {
    const reader = new WebSocketMessageReader(ws);
    const writer = new WebSocketMessageWriter(ws);
    createWsConnection(reader, writer);
  }

  listenForMessages() {
    this.server.on('connection', (ws) => {
      this.pipeSocket(toIWebSocket(ws));
    });
  }
}
