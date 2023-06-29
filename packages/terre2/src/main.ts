import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { _open } from './util/open';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}

bootstrap().then(() => {
  console.log(`WebGAL Terre 4.4.0-alpha3 starting at ${process.cwd()}`);
  if ((process?.env?.NODE_ENV ?? '') !== 'development')
    _open('http://localhost:3001');
});
