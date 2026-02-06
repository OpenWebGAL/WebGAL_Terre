import { ApiProperty } from '@nestjs/swagger';

export class TemplateFontConfigDto {
  @ApiProperty({ description: 'The font-family name' })
  ['font-family']: string;

  @ApiProperty({ description: 'The url of the font file' })
  url: string;

  @ApiProperty({
    description: 'The font type used for @font-face format',
    enum: ['truetype', 'opentype', 'woff', 'woff2', 'embedded-opentype', 'svg'],
  })
  type: string;
}

export class TemplateConfigDto {
  @ApiProperty({ description: 'The name of the template' })
  name: string;
  @ApiProperty({ description: 'The id of the template' })
  id?: string;
  @ApiProperty({ description: 'The webgal version of the template' })
  'webgal-version': string;
  @ApiProperty({
    description: 'The font registrations of the template',
    required: false,
    type: TemplateFontConfigDto,
    isArray: true,
  })
  fonts?: TemplateFontConfigDto[];
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

export class OutputTemplateDto {
  @ApiProperty({ description: 'The path of the source directory' })
  sourceDir: string;

  @ApiProperty({ description: 'The path of the out directory' })
  outPath: string;
}

export class ImportTemplateDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: "The template's zip file",
  })
  file: any;
}
