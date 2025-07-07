import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OsInfoDto } from './app.dto';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/test')
  apiTest(): string {
    return this.appService.getApiTest();
  }

  @Get('/api/osinfo')
  @ApiResponse({
    status: 200,
    description: 'Returns the OS information.',
    type: OsInfoDto,
  })
  getOsInfo(): OsInfoDto {
    return this.appService.getOsInfo();
  }
}
