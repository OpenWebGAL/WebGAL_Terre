import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Controller('api/hello')
export class HelloController {
  constructor(
    private readonly helloService: HelloService,
    private readonly webgalfs: WebgalFsService,
  ) {}

  @Get()
  apiTest(): string {
    this.webgalfs.greet();
    return this.helloService.getHelloText();
  }
}
