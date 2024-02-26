import { Module } from '@nestjs/common';
import { ManageTemplateService } from './manage-template.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';
import { ManageTemplateController } from './manage-template.controller';
import { LspModule } from '../lsp/lsp.module';

@Module({
  imports: [WebgalFsModule, LspModule],
  providers: [ManageTemplateService],
  controllers: [ManageTemplateController],
})
export class ManageTemplateModule {}
