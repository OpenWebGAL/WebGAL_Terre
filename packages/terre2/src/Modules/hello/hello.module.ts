import { Module } from '@nestjs/common';
import { HelloService } from './hello.service';
import { HelloController } from './hello.controller';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';

@Module({
  imports: [WebgalFsModule],
  providers: [HelloService],
  controllers: [HelloController],
})
export class HelloModule {}
