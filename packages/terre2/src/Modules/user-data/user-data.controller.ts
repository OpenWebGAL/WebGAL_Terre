import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  OpenUserDataPathDto,
  SetUserDataPathDto,
  UserDataOperationResultDto,
  UserDataStatusDto,
} from './user-data.dto';
import { UserDataService } from './user-data.service';

@Controller('api/userData')
@ApiTags('User Data')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get user data status' })
  @ApiResponse({ status: 200, type: UserDataStatusDto })
  async getStatus(): Promise<UserDataStatusDto> {
    return this.userDataService.getStatus();
  }

  @Post('migrateLegacy')
  @ApiOperation({ summary: 'Migrate legacy install-dir user data' })
  @ApiResponse({ status: 200, type: UserDataOperationResultDto })
  async migrateLegacy(): Promise<UserDataOperationResultDto> {
    return this.userDataService.migrateLegacy();
  }

  @Post('setPath')
  @ApiOperation({ summary: 'Set and migrate user data path' })
  @ApiBody({ type: SetUserDataPathDto })
  @ApiResponse({ status: 200, type: UserDataOperationResultDto })
  async setPath(
    @Body() setPathDto: SetUserDataPathDto,
  ): Promise<UserDataOperationResultDto> {
    return this.userDataService.setUserDataPath(setPathDto.userDataPath);
  }

  @Post('resetPath')
  @ApiOperation({ summary: 'Reset user data path to the default path' })
  @ApiResponse({ status: 200, type: UserDataOperationResultDto })
  async resetPath(): Promise<UserDataOperationResultDto> {
    return this.userDataService.resetUserDataPath();
  }

  @Post('open')
  @ApiOperation({ summary: 'Open user data related directory' })
  @ApiBody({ type: OpenUserDataPathDto })
  async open(@Body() openDto: OpenUserDataPathDto) {
    return this.userDataService.open(openDto.target ?? 'active');
  }
}
