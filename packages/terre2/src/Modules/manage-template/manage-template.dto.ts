import { ApiProperty } from '@nestjs/swagger';

export class TemplateConfigDto {
  @ApiProperty({ description: 'The name of the template' })
  name: string;
  @ApiProperty({ description: 'The id of the template' })
  id?: string;
  @ApiProperty({ description: 'The webgal version of the template' })
  'webgal-version': string;
}

export class TemplateInfoDto extends TemplateConfigDto {
  @ApiProperty({ description: 'The dir of the template' })
  dir: string;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'The name of the template to be created' })
  templateName: string;
  @ApiProperty({ description: 'The dir of the template' })
  templateDir: string;
}

export class UpdateTemplateConfigDto {
  @ApiProperty({ description: 'The dir of the template' })
  templateDir: string;
  @ApiProperty({ description: 'The new config of the template' })
  newTemplateConfig: TemplateConfigDto;
}

export class GetStyleByClassNameDto {
  @ApiProperty({ description: 'The name of class to be fetched' })
  className: string;
  @ApiProperty({ description: 'The path of stylesheet file to be fetched' })
  filePath: string;
}
