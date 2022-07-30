import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as ws from 'ws';

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
