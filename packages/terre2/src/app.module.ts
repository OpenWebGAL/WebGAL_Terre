import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ManageGameModule } from './Modules/manage-game/manage-game.module';

@Module({
  imports: [
    ManageGameModule,
    // 静态文件服务：游戏与编辑器静态资源文件
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    // 静态文件服务：引擎模板
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets', 'templates', 'WebGAL_Template'),
      serveRoot: '/Games/:gamename/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
