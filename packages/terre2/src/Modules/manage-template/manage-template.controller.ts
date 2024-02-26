import {
  Body,
  ConsoleLogger,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ManageTemplateService } from './manage-template.service';
import { LspService } from '../lsp/lsp.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import { CreateTemplateDto } from './manage-template.dto';
import {
  // ... (其他的导入)
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
@Controller('api/manageTemplate')
@ApiTags('Manage Template')
export class ManageTemplateController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageTemplate: ManageTemplateService,
    private readonly logger: ConsoleLogger,
    private readonly lspServerce: LspService,
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
      `/public/templates/${decodeURI(templateName)}/template/template.json`,
    );
    return this.webgalFs.readTextFile(configFilePath);
  }
}
