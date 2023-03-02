import { Module } from '@nestjs/common';
import { ManageGameService } from './manage-game.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';
import { ManageGameController } from './manage-game.controller';
import { LspModule } from '../lsp/lsp.module';

@Module({
  imports: [WebgalFsModule, LspModule],
  providers: [ManageGameService],
  controllers: [ManageGameController],
})
export class ManageGameModule {}
