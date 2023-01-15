import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as ws from 'ws';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    const wsServer = new ws.WebSocketServer({ port: 9999 });

    const connectionList = [];

    wsServer.on('connection', (conn) => {
      connectionList.push(conn);
      conn.on('message', (data) => {
        const str = data.toString();
        connectionList.forEach((e) => {
          e.send(str);
        });
      });
    });
  }

  @Get('/api/test')
  apiTest(): string {
    return this.appService.getApiTest();
  }
}
