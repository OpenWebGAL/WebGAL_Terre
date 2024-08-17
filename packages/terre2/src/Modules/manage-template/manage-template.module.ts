import { Module } from '@nestjs/common';
import { ManageTemplateService } from './manage-template.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';
import { ManageTemplateController } from './manage-template.controller';

@Module({
  imports: [WebgalFsModule],
  providers: [ManageTemplateService],
  controllers: [ManageTemplateController],
})
export class ManageTemplateModule {}
