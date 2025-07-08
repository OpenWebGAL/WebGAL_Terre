import { ApiProperty } from '@nestjs/swagger';

export class OsInfoDto {
  @ApiProperty({ description: 'The platform of the operating system' })
  platform: string;
  @ApiProperty({ description: 'The architecture of the operating system' })
  arch: string;
}
