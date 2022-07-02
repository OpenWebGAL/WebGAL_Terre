import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiTest() {
    return 'API Test OK';
  }
}
