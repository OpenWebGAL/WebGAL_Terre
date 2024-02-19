import { Module } from '@nestjs/common';
import { TemplatePreviewController } from './template-preview.controller';
import { TemplatePreviewService } from './template-preview.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';

@Module({
  imports: [WebgalFsModule],
  controllers: [TemplatePreviewController],
  providers: [TemplatePreviewService],
})
export class TemplatePreviewModule {}
