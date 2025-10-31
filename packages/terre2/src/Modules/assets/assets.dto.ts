import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesDto {
  @ApiProperty({ description: 'Target directory for the uploaded files' })
  targetDirectory: string;
}

export class CreateNewFileDto {
  @ApiProperty({
    description: 'The source path where the directory will be created',
  })
  source: string;

  @ApiProperty({ description: 'Name for the new file' })
  name: string;
}

export class CreateNewFolderDto {
  @ApiProperty({
    description: 'The source path where the directory will be created',
  })
  source: string;

  @ApiProperty({ description: 'Name for the new directory' })
  name: string;
}

export class DeleteFileOrDirDto {
  @ApiProperty({
    description: 'The source path of the file or directory to be deleted',
  })
  source: string;
}

export class RenameFileDto {
  @ApiProperty({
    description: 'The source path of the file or directory to be renamed',
  })
  source: string;

  @ApiProperty({ description: 'New name for renaming the file or directory' })
  newName: string;
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

export class ApplyTemplateToGameDto {
  @ApiProperty({ description: 'The template name to apply' })
  templateDir: string;

  @ApiProperty({
    description: 'The game name to be applied.',
  })
  gameDir: string;
}

export class ImageDimensionsResponseDto {
  @ApiProperty({ description: 'Width of the image in pixels' })
  width: number;

  @ApiProperty({ description: 'Height of the image in pixels' })
  height: number;

  @ApiProperty({ description: 'Image file type (e.g., jpg, png, gif, webp)' })
  type: string;
}
