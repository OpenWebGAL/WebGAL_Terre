import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiTest() {
    return 'WebGAL Terre Application API Test OK';
  }
}
