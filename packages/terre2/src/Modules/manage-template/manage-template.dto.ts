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
  @ApiProperty({ description: 'The id of the template', required: false })
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
  @ApiProperty({
    description: 'UI template mode',
    enum: ['legacy', 'custom'],
    required: false,
  })
  uiMode?: 'legacy' | 'custom';
  @ApiProperty({
    description: 'Active variant per UI screen slot',
    required: false,
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  screens?: Record<string, string>;
}

export class TemplateScreenVariantDto {
  @ApiProperty({ description: 'Variant identifier' })
  variantId: string;
  @ApiProperty({ description: 'Display name of the variant' })
  name: string;
  @ApiProperty({ description: 'Whether this variant is built into WebGAL' })
  builtIn: boolean;
  @ApiProperty({
    description: 'Whether a custom index.js entry exists on disk',
  })
  hasEntryJs: boolean;
  @ApiProperty({
    description: 'Relative path to style.scss inside the template',
  })
  scssPath: string;
}

export class TemplateScreenSlotDto {
  @ApiProperty({ description: 'UI screen slot identifier' })
  screen: string;
  @ApiProperty({ description: 'Currently active variantId for this screen' })
  activeVariant: string;
  @ApiProperty({
    description: 'Available built-in and custom variants',
    type: TemplateScreenVariantDto,
    isArray: true,
  })
  variants: TemplateScreenVariantDto[];
}

export class TemplateScreensResponseDto {
  @ApiProperty({ description: 'Resolved UI mode', enum: ['legacy', 'custom'] })
  uiMode: 'legacy' | 'custom';
  @ApiProperty({
    description: 'Whether this template uses legacy (< 4.7) format',
    required: false,
  })
  isLegacy?: boolean;
  @ApiProperty({
    description: 'Screen slot definitions and variants',
    type: TemplateScreenSlotDto,
    isArray: true,
  })
  screens: TemplateScreenSlotDto[];
}

export class SwitchScreenVariantDto {
  @ApiProperty({ description: 'The directory name of the template' })
  templateDir: string;
  @ApiProperty({ description: 'Target UI screen slot identifier' })
  screen: string;
  @ApiProperty({ description: 'Target variantId to activate' })
  variantId: string;
}

export class ImportScreenVariantDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Zip package of the custom UI screen',
  })
  file: any;
  @ApiProperty({ description: 'The directory name of the template' })
  templateDir: string;
  @ApiProperty({ description: 'Target UI screen slot identifier' })
  screen: string;
  @ApiProperty({ description: 'Optional preferred variantId', required: false })
  variantId?: string;
}

export class ImportScreenVariantResponseDto {
  @ApiProperty({ description: 'Resolved variantId written on disk' })
  variantId: string;
  @ApiProperty({
    description: 'Relative path to style.scss inside the template',
  })
  scssPath: string;
  @ApiProperty({
    description: 'Updated template configuration',
    type: TemplateConfigDto,
  })
  config: TemplateConfigDto;
}

export class TemplateInfoDto extends TemplateConfigDto {
  @ApiProperty({ description: 'The dir of the template' })
  dir: string;

  @ApiProperty({ description: 'Whether the template is built in' })
  builtIn?: boolean;

  @ApiProperty({
    description: 'Whether the template uses legacy (< 4.7) format',
    required: false,
  })
  isLegacy?: boolean;
}

export class UpgradeTemplateDto {
  @ApiProperty({ description: 'The directory name of the template to upgrade' })
  templateDir: string;
}

export class UpgradeGameTemplateDto {
  @ApiProperty({
    description: 'The directory name of the game whose template to upgrade',
  })
  gameDir: string;
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
  @ApiProperty({ description: 'The template directory name' })
  templateDir: string;
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
