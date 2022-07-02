import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class WebgalFsService {
  constructor(private readonly logger: ConsoleLogger) {}
  greet() {
    this.logger.log('123');
  }
}
