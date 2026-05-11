import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManageGameModule } from './Modules/manage-game/manage-game.module';
import { ManageTemplateModule } from './Modules/manage-template/manage-template.module';
// import { LspModule } from './Modules/lsp/lsp.module';
import { AssetsModule } from './Modules/assets/assets.module';
import { WebGalWebSocketGateway } from './Modules/websocket/websocketGateway';
import { LspGateway } from './Modules/lsp/gateway';
import { UserDataModule } from './Modules/user-data/user-data.module';

@Module({
  imports: [
    UserDataModule,
    // 代码提示
    // LspModule,
    // 资源管理
    AssetsModule,
    ManageGameModule,
    ManageTemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebGalWebSocketGateway, LspGateway],
})
export class AppModule {}
