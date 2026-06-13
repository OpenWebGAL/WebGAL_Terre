import { ApiProperty } from '@nestjs/swagger';

export class UserDataLegacyMigrationStatusDto {
  @ApiProperty({ description: 'Whether legacy games exist in the install dir' })
  hasLegacyGames: boolean;

  @ApiProperty({
    description: 'Whether legacy custom templates exist in the install dir',
  })
  hasLegacyCustomTemplates: boolean;

  @ApiProperty({
    description: 'Whether legacy derivative engines exist in the install dir',
  })
  hasLegacyDerivativeEngines: boolean;

  @ApiProperty({ description: 'Whether UI should show the migration notice' })
  needsMigrationNotice: boolean;
}

export class UserDataStatusDto {
  @ApiProperty({ description: 'The application install/runtime root' })
  appRoot: string;

  @ApiProperty({ description: 'The unified configuration directory' })
  configRoot: string;

  @ApiProperty({ description: 'The unified configuration file path' })
  configPath: string;

  @ApiProperty({ description: 'The default user data directory' })
  defaultUserDataRoot: string;

  @ApiProperty({ description: 'The configured user data directory' })
  configuredUserDataRoot: string;

  @ApiProperty({ description: 'The currently active user data directory' })
  activeUserDataRoot: string;

  @ApiProperty({ description: 'The portable data directory under app root' })
  portableDataRoot: string;

  @ApiProperty({ description: 'Whether portable mode is currently active' })
  isPortable: boolean;

  @ApiProperty({ description: 'Whether app root data dir exists' })
  hasPortableDataDir: boolean;

  @ApiProperty({ type: UserDataLegacyMigrationStatusDto })
  legacyMigration: UserDataLegacyMigrationStatusDto;
}

export class SetUserDataPathDto {
  @ApiProperty({ description: 'The target user data directory' })
  userDataPath: string;
}

export class OpenUserDataPathDto {
  @ApiProperty({
    description: 'The path target to open',
    enum: ['active', 'config', 'portable', 'app'],
    required: false,
  })
  target?: 'active' | 'config' | 'portable' | 'app';
}

export class UserDataOperationResultDto {
  @ApiProperty({ description: 'Whether the operation succeeded' })
  success: boolean;

  @ApiProperty({ description: 'Human-readable operation message' })
  message: string;

  @ApiProperty({ description: 'Paths that could not be moved', type: [String] })
  conflicts: string[];

  @ApiProperty({ type: UserDataStatusDto })
  status: UserDataStatusDto;
}
