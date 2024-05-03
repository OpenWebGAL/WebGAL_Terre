import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'The name of the template to be created' })
  templateName: string;
}

export class GetStyleByClassNameDto {
  @ApiProperty({ description: 'The name of class to be fetched' })
  className: string;
  @ApiProperty({ description: 'The path of stylesheet file to be fetched' })
  filePath: string;
}
