import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  @Get('/api/hello')
  getHelloText() {
    return 'Hello,World!';
  }
}
