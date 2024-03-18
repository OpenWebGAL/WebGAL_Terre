import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ManageGameModule } from './Modules/manage-game/manage-game.module';
import { ManageTemplateModule } from './Modules/manage-template/manage-template.module';
import { LspModule } from './Modules/lsp/lsp.module';
import { TemplatePreviewModule } from './Modules/template-preview/template-preview.module';
import { AssetsModule } from './Modules/assets/assets.module';

@Module({
  imports: [
    // 代码提示
    LspModule,
    // 资源管理
    AssetsModule,
    ManageGameModule,
    ManageTemplateModule,
    TemplatePreviewModule,
    // 静态文件服务：游戏与编辑器静态资源文件
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    // 静态文件服务：引擎模板
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets', 'templates', 'WebGAL_Template'),
      serveRoot: '/games/:gamename/',
    }),
    // 静态文件服务：引擎模板预览用游戏
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets', 'templates', 'WebGAL_Template'),
      serveRoot: '/template-preview/:template/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
