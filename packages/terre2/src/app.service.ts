import { Injectable } from '@nestjs/common';
import { arch, platform } from 'os';
import { OsInfoDto } from './app.dto';

@Injectable()
export class AppService {
  getApiTest(): string {
    return 'WebGAL Terre Application API Test OK';
  }

  getOsInfo(): OsInfoDto {
    return {
      platform: platform(),
      arch: arch(),
    };
  }
}
