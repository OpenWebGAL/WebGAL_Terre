import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';

@Module({
  imports: [WebgalFsModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
