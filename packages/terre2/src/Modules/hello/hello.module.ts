import { Module } from '@nestjs/common';
import { HelloService } from './hello.service';
import { HelloController } from './hello.controller';

@Module({
  providers: [HelloService],
  controllers: [HelloController],
})
export class HelloModule {}
