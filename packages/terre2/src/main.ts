import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as ws from 'ws';
import open = require('open');

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
  console.log(`WebGAL Terre 2.3.11 starting at ${process.cwd()}`);
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  open('http://localhost:3001');
}

bootstrap();
