import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import open = require('open');
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}

bootstrap().then(() => {
  console.log(`WebGAL Terre 2.3.11 starting at ${process.cwd()}`);
  open('http://localhost:3001');
});
