import { Injectable } from '@nestjs/common';
import { platform } from 'os';
import { OsInfoDto } from './app.dto';

@Injectable()
export class AppService {
  getApiTest(): string {
    return 'WebGAL Terre Application API Test OK';
  }

  getOsInfo(): OsInfoDto {
    return {
      platform: platform(),
    };
  }
}
