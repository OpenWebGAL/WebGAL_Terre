import {
  // ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ path: '/api/webgalsync', transports: 'websocket' })
export class WebGalWebSocketGateway {
  @WebSocketServer()
  private server: Server;

  private connectionList: WebSocket[] = [];

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: WebSocket) {
    this.connectionList.push(client);
  }

  handleDisconnect(client: WebSocket) {
    const index = this.connectionList.indexOf(client);
    if (index !== -1) {
      this.connectionList.splice(index, 1);
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string, // @ConnectedSocket() client: WebSocket,
  ): void {
    this.connectionList.forEach((socket) => {
      const sendData = JSON.stringify({
        event: 'message',
        data,
      });
      socket.send(sendData);
    });
  }
}
