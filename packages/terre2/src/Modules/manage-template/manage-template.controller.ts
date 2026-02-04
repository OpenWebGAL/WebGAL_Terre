import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ManageTemplateService } from './manage-template.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';
import {
  CreateTemplateDto,
  GetStyleByClassNameDto,
  OutputTemplateDto,
  TemplateConfigDto,
  TemplateInfoDto,
  UpdateTemplateConfigDto,
} from './manage-template.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApplyTemplateToGameDto } from '../assets/assets.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('api/manageTemplate')
@ApiTags('Manage Template')
export class ManageTemplateController {
  constructor(
    private readonly webgalFs: WebgalFsService,
    private readonly manageTemplate: ManageTemplateService,
  ) {}

  @Get('templateList')
  @ApiOperation({ summary: 'Retrieve template list' })
  @ApiResponse({
    status: 200,
    type: [TemplateInfoDto],
    description: 'Returned template list.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getTemplateList(): Promise<TemplateInfoDto[]> {
    try {
      const templateList = await this.manageTemplate.getTemplateList();
      return templateList;
    } catch (error) {
      console.error('Error retrieving template list:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('createTemplate')
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({
    status: 200,
    description: 'Template creation result.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @ApiBody({ type: CreateTemplateDto, description: 'Template creation data' })
  async createTemplate(@Body() createTemplateData: CreateTemplateDto) {
    try {
      const createResult = await this.manageTemplate.createTemplate(
        createTemplateData.templateName,
        createTemplateData.templateDir,
      );

      if (createResult) {
        return { status: 'success', message: 'Template created successfully.' };
      } else {
        return { status: 'failed', message: 'Failed to create template.' };
      }
    } catch (error) {
      console.error('Error creating template:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getTemplateConfig/:templateDir')
  @ApiOperation({ summary: 'Get Template Configuration' })
  @ApiResponse({
    status: 200,
    type: TemplateConfigDto,
    description: 'Returned template configuration.',
  })
  @ApiResponse({
    status: 404,
    description: 'Template configuration not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async getTemplateConfig(
    @Param('templateDir') templateDir: string,
  ): Promise<TemplateConfigDto> {
    try {
      const templateConfig = await this.manageTemplate.getTemplateConfig(
        templateDir,
      );

      if (!templateConfig) {
        throw new HttpException(
          { status: 'error', message: 'Template configuration not found.' },
          HttpStatus.NOT_FOUND,
        );
      }

      return templateConfig;
    } catch (error) {
      console.error('Error retrieving template configuration:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('updateTemplateConfig')
  @ApiOperation({ summary: 'Update template configuration' })
  @ApiResponse({
    status: 200,
    description: 'Template configuration updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 404,
    description: 'Template configuration not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(200)
  async updateTemplateConfig(
    @Body() updateTemplateConfigDto: UpdateTemplateConfigDto,
  ) {
    try {
      const result = await this.manageTemplate.updateTemplateConfig(
        updateTemplateConfigDto.templateDir,
        updateTemplateConfigDto.newTemplateConfig,
      );

      if (!result) {
        throw new HttpException(
          { status: 'error', message: 'Template configuration not found.' },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: 'success',
        message: 'Template configuration updated successfully.',
      };
    } catch (error) {
      console.error('Error updating template configuration:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('delete/:templateDir')
  @ApiOperation({ summary: 'Delete Template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteTemplate(@Param('templateDir') templateDir: string) {
    try {
      const deleteResult = await this.manageTemplate.deleteTemplate(
        templateDir,
      );

      if (!deleteResult) {
        throw new HttpException(
          { status: 'error', message: 'Template not found.' },
          HttpStatus.NOT_FOUND,
        );
      }

      return;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('applyTemplateToGame')
  @ApiOperation({ summary: 'Apply template to a game' })
  @ApiResponse({
    status: 200,
    description: 'Template applied successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or failed to apply template.',
  })
  @ApiResponse({
    status: 404,
    description: 'Template or game directory not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async applyTemplateToGame(
    @Body() applyTemplateToGame: ApplyTemplateToGameDto,
  ) {
    try {
      const result = await this.manageTemplate.applyTemplateToGame(
        applyTemplateToGame.templateDir,
        applyTemplateToGame.gameDir,
      );

      if (!result) {
        throw new HttpException(
          { status: 'error', message: 'Failed to apply template.' },
          HttpStatus.BAD_REQUEST,
        );
      }

      return;
    } catch (error) {
      console.error('Error applying template to game:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('getStyleByClassName')
  @ApiOperation({ summary: 'Get style by class name' })
  @ApiResponse({
    status: 200,
    type: String,
    description: 'Returned style information.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Style not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @HttpCode(200)
  async getStyleByClassName(
    @Body() getStyleDto: GetStyleByClassNameDto,
  ): Promise<string> {
    try {
      const style = await this.manageTemplate.getStyleByClass(
        getStyleDto.filePath,
        getStyleDto.className,
      );

      if (!style) {
        throw new HttpException(
          { status: 'error', message: 'Style not found.' },
          HttpStatus.NOT_FOUND,
        );
      }

      return style;
    } catch (error) {
      console.error('Error getting style by class name:', error);
      throw new HttpException(
        { status: 'error', message: 'Internal server error.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('outputTemplate')
  @ApiOperation({ summary: 'Output Template' })
  @ApiResponse({
    status: 200,
    description: 'Output Template Successfully.',
  })
  @ApiResponse({ status: 400, description: 'Output Template Failed.' })
  async outputTemplate(@Body() outputTemplateParms: OutputTemplateDto) {
    return await this.manageTemplate.outputTemplate(
      outputTemplateParms.sourceDir,
      outputTemplateParms.outPath,
    );
  }

  @Post('importTemplate')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import Template' })
  @ApiResponse({
    status: 200,
    description: 'Import Template Successfully.',
  })
  @ApiResponse({ status: 400, description: 'Import Template Failed.' })
  async importTemplate(@UploadedFile() file) {
    return await this.manageTemplate.importTemplate(file.buffer);
  }
}
