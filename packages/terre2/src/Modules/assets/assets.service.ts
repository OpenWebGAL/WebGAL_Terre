import { Injectable } from '@nestjs/common';
import sizeOf from 'image-size';
import { readFileSync } from 'fs';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

@Injectable()
export class AssetsService {
  constructor(private readonly webgalFs: WebgalFsService) {}

  /**
   * 获取图片的尺寸信息
   * @param imagePath 图片相对路径(相对于 public/)
   * @returns 图片的宽度、高度和类型
   */
  async getImageDimensions(imagePath: string) {
    try {
      const fullPath = this.webgalFs.getPathFromRoot(`public/${imagePath}`);
      const buffer = readFileSync(fullPath);
      const dimensions = sizeOf(buffer);
      
      return {
        width: dimensions.width,
        height: dimensions.height,
        type: dimensions.type,
      };
    } catch (error) {
      throw new Error(`Failed to get image dimensions: ${error.message}`);
    }
  }
}
