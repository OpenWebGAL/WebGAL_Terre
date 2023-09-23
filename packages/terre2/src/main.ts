import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { _open } from './util/open';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3001);
}

bootstrap().then(() => {
  console.log(`WebGAL Terre 4.4.5 starting at ${process.cwd()}`);
  if ((process?.env?.NODE_ENV ?? '') !== 'development')
    _open('http://localhost:3001');
});
