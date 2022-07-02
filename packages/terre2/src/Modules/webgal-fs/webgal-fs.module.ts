import { ConsoleLogger, Module } from '@nestjs/common';
import { WebgalFsService } from './webgal-fs.service';

@Module({
  providers: [WebgalFsService, ConsoleLogger],
  exports: [WebgalFsService],
})
export class WebgalFsModule {}
