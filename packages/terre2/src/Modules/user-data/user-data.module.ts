import { Global, Module } from '@nestjs/common';
import { ConsoleLogger } from '@nestjs/common';
import { LogicalStaticController } from './logical-static.controller';
import { UserDataController } from './user-data.controller';
import { UserDataService } from './user-data.service';

@Global()
@Module({
  controllers: [UserDataController, LogicalStaticController],
  providers: [UserDataService, ConsoleLogger],
  exports: [UserDataService],
})
export class UserDataModule {}
