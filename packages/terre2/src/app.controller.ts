import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/test')
  apiTest(): string {
    return this.appService.getApiTest();
  }
}
