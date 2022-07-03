import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join } from 'path';

export interface IFileInfo {
  name: string;
  isDir: boolean;
}

@Injectable()
export class WebgalFsService {
  constructor(private readonly logger: ConsoleLogger) {}
  greet() {
    this.logger.log('Welcome to WebGAl Files System Service!');
  }

  /**
   * 获取目录下文件信息
   * @param dir 目录，需用 path 处理。
   */
  async getDirInfo(dir: string) {
    const fileNames = await fs.readdir(dir);
    const dirInfoPromises = fileNames.map((e) => {
      return new Promise((resolve) => {
        fs.stat(this.getPath(`${dir}/${e}`)).then((result) => {
          const ret: IFileInfo = {
            name: e,
            isDir: result.isDirectory(),
          };
          resolve(ret);
        });
      });
    });
    return await Promise.all(dirInfoPromises);
  }

  /**
   * 复制（递归复制），路径需使用 path 处理。
   * @param src 源文件夹
   * @param dest 目标文件夹
   */
  async copy(src: string, dest: string) {
    return await fs.cp(src, dest, { recursive: true });
  }

  /**
   * 将字符串路径解析，根目录是进程运行目录
   * @param rawPath 字符串路径
   */
  getPathFromRoot(rawPath: string) {
    return join(process.cwd(), ...rawPath.split('/'));
  }

  async mkdir(src, dirName) {
    return await fs.mkdir(`${src}/${dirName}`);
  }

  /**
   * 将字符串路径解析
   * @param rawPath 字符串路径
   */
  getPath(rawPath: string) {
    return join(...rawPath.split('/'));
  }
}
