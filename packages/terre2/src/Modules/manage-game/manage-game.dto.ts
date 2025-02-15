import { ApiProperty } from '@nestjs/swagger';
import { TemplateConfigDto } from '../manage-template/manage-template.dto';

export class CreateGameDto {
  @ApiProperty({ description: 'The name of the game to be created' })
  gameName: string;
  @ApiProperty({ description: 'The name of the derivative to be used' })
  derivative?: string;
  @ApiProperty({ description: 'The name of the template to be applied' })
  templateName?: string;
}

export class EditFileNameDto {
  @ApiProperty({ description: 'The path to the file to be renamed' })
  path: string;

  @ApiProperty({ description: 'The new name for the file' })
  newName: string;
}

export class DeleteFileDto {
  @ApiProperty({ description: 'The path to the file to be deleted' })
  path: string;
}

export class CreateNewSceneDto {
  @ApiProperty({ description: 'The name of the game' })
  gameName: string;

  @ApiProperty({ description: 'The name of the scene' })
  sceneName: string;
}

export class EditSceneDto {
  @ApiProperty({ description: 'The name of the game' })
  gameName: string;

  @ApiProperty({ description: 'The name of the scene' })
  sceneName: string;

  @ApiProperty({
    description: 'Scene data content',
    type: 'string',
    format: '{ value: string }',
  })
  sceneData: string;
}

export class EditTextFileDto {
  @ApiProperty({ description: 'The path of textfile' })
  path: string;

  @ApiProperty({
    description: 'Text data content',
    type: 'string',
  })
  textFile: string;
}

// game-config.dto.ts
export class GameConfigDto {
  @ApiProperty({ description: 'The name of the game' })
  gameName: string;

  @ApiProperty({ description: 'New game configuration' })
  newConfig: string;
}

export class GameInfoDto {
  @ApiProperty({ description: 'The name of the game' })
  name: string;
  @ApiProperty({ description: 'The dir of the game' })
  dir: string;
  @ApiProperty({ description: 'The cover of the game' })
  cover: string;
  @ApiProperty({ description: 'The template config of the game' })
  template: TemplateConfigDto;
}

export class UploadFilesDto {
  @ApiProperty({ description: 'Target directory for the uploaded files' })
  targetDirectory: string;
}

export class MkDirDto {
  @ApiProperty({
    description: 'The source path where the directory will be created',
  })
  source: string;

  @ApiProperty({ description: 'Name for the new directory' })
  name: string;
}

export class DeleteDto {
  @ApiProperty({
    description: 'The source path of the file or directory to be deleted',
  })
  gameName: string;
}

export class RenameDto {
  @ApiProperty({
    description: 'Old name for renaming the game',
  })
  gameName: string;

  @ApiProperty({ description: 'New name for renaming the game' })
  newName: string;
}

export type Platform = 'web' | 'electron' | 'android';

export const platforms: Platform[] = ['web', 'electron', 'android'];

export class IconsDto {
  @ApiProperty({ description: 'The icons of the game' })
  platforms: Platform[];
}
