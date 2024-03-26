import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ManageTemplateService } from './manage-template.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import {
  CreateTemplateDto,
  GetStyleByClassNameDto,
} from './manage-template.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApplyTemplateToGameDto } from '../assets/assets.dto';
@Controller('api/manageTemplate')
@ApiTags('Manage Template')
export class ManageTemplateController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageTemplate: ManageTemplateService,
  ) {}

  @Get('templateList')
  @Get('templateList')
  @ApiOperation({ summary: 'Retrieve template list' })
  @ApiResponse({ status: 200, description: 'Returned template list.' })
  async getTemplateList() {
    if (!(await this.webgalFs.existsDir('public/templates')))
      await this.webgalFs.mkdir('public', 'templates');
    return await this.webgalFs.getDirInfo(
      this.webgalFs.getPathFromRoot('/public/templates'),
    );
  }

  @Post('createTemplate')
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({ status: 200, description: 'Template creation result.' })
  @ApiBody({ type: CreateTemplateDto, description: 'Template creation data' })
  async createTemplate(@Body() createTemplateData: CreateTemplateDto) {
    const createResult = await this.manageTemplate.createTemplate(
      createTemplateData.templateName,
    );
    if (createResult) {
      return { status: 'success' };
    } else {
      return { status: 'failed' }; // Note: Typo correction 'filed' -> 'failed'
    }
  }

  @Get('getTemplateConfig/:templateName')
  @ApiOperation({ summary: 'Get Template Configuration' })
  @ApiResponse({ status: 200, description: 'Returned template configuration.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to get the template configuration.',
  })
  async getTemplateConfig(@Param('templateName') templateName: string) {
    const configFilePath = this.webgalFs.getPathFromRoot(
      `/public/templates/${decodeURI(templateName)}/template.json`,
    );
    return this.webgalFs.readTextFile(configFilePath);
  }

  @Delete('delete/:templateName')
  @ApiOperation({ summary: 'Delete Template' })
  @ApiResponse({ status: 200, description: 'Returned delete result.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete.',
  })
  async deleteTemplate(@Param('templateName') templateName: string) {
    return this.manageTemplate.deleteTemplate(templateName);
  }

  @Post('applyTemplateToGame')
  @ApiOperation({ summary: 'Apply template to a game' })
  @ApiResponse({ status: 200, description: 'Returned apply result.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete.',
  })
  async applyTemplateToGame(
    @Body() applyTemplateToGame: ApplyTemplateToGameDto,
  ) {
    return this.manageTemplate.applyTemplateToGame(
      applyTemplateToGame.templateName,
      applyTemplateToGame.gameName,
    );
  }

  @Post('getStyleByClassName')
  @ApiOperation({ summary: 'Apply template to a game' })
  @ApiResponse({ status: 200, description: 'Returned apply result.' })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete.',
  })
  @HttpCode(200)
  async getStyleByClassName(@Body() getStyleDto: GetStyleByClassNameDto) {
    return this.manageTemplate.getStyleByClass(
      getStyleDto.filePath,
      getStyleDto.className,
    );
  }
}
