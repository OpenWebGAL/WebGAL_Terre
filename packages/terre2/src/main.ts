import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { _open } from './util/open';
import { urlencoded, json } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { WsAdapter } from '@nestjs/platform-ws';

let WEBGAL_PORT = 3000; // default port
const version_number = `4.5.3`;
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const config = new DocumentBuilder()
    .setTitle('WebGAL Terre API')
    .setDescription('API Refrence of WebGAL Terre Editor')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(WEBGAL_PORT + 1);
}

bootstrap().then(() => {
  console.log(`WebGAL Terre ${version_number} starting at ${process.cwd()}`);
  if ((process?.env?.NODE_ENV ?? '') !== 'development' && !global['isElectron'])
    _open(`http://localhost:${WEBGAL_PORT + 1}`);
});
