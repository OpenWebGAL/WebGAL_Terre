import * as process from 'process';

const args = process.argv.slice(2);
let cwd = process.cwd();

const cwdIndex = args.indexOf('--cwd');
if (cwdIndex !== -1 && cwdIndex + 1 < args.length) {
  cwd = args[cwdIndex + 1];
}

process.chdir(cwd);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { _open } from './util/open';
import { urlencoded, json } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { WsAdapter } from '@nestjs/platform-ws';
import './logger';
import * as path from 'path';
import * as fsExtra from 'fs-extra';

let WEBGAL_PORT = 3000; // 默认端口
export const version_number = `4.5.15`;
if (env.WEBGAL_PORT) {
  WEBGAL_PORT = Number.parseInt(env.WEBGAL_PORT);
}

/**
 * 确保模板文件存在
 * 如果 assets/templates/WebGAL_Template 下没有 index.html，则从 node_modules/webgal-engine/dist 复制所需文件
 */
async function ensureTemplateFiles() {
  const cwd = process.cwd();
  const templateDir = path.join(cwd, 'assets', 'templates', 'WebGAL_Template');
  const indexPath = path.join(templateDir, 'index.html');

  // 检查 index.html 是否存在
  const indexExists = await fsExtra.pathExists(indexPath);
  if (!indexExists) {
    console.log('模板文件未找到，正在从 node_modules 复制...');
    try {
      // 源文件路径
      const sourceAssetsDir = path.join(
        cwd,
        'node_modules',
        'webgal-engine',
        'dist',
        'assets',
      );
      const sourceIndex = path.join(
        cwd,
        'node_modules',
        'webgal-engine',
        'dist',
        'index.html',
      );
      const sourceServiceWorker = path.join(
        cwd,
        'node_modules',
        'webgal-engine',
        'dist',
        'webgal-serviceworker.js',
      );

      // 目标文件路径
      const targetAssetsDir = path.join(templateDir, 'assets');
      const targetIndex = path.join(templateDir, 'index.html');
      const targetServiceWorker = path.join(
        templateDir,
        'webgal-serviceworker.js',
      );

      // 确保目标目录存在
      await fsExtra.ensureDir(templateDir);

      // 并行复制文件和目录
      await Promise.all([
        fsExtra.copy(sourceAssetsDir, targetAssetsDir),
        fsExtra.copy(sourceIndex, targetIndex),
        fsExtra.copy(sourceServiceWorker, targetServiceWorker),
      ]);

      console.log('模板文件复制成功。');
    } catch (error) {
      console.error('复制模板文件时出错:', error);
    }
  }
}

async function bootstrap() {
  // 在启动应用前确保模板文件存在
  await ensureTemplateFiles();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: '*', // Expose all headers
  });

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
