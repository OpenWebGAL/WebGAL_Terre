import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { _open } from './util/open';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}

bootstrap().then(() => {
  console.log(`WebGAL Terre 2.3.11 starting at ${process.cwd()}`);
  _open('http://localhost:3001');
});
