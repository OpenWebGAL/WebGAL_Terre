import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHelloText() {
    return 'Welcome to WebGAL Terre!';
  }
}
