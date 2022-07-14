import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { extname, join } from 'path';

export interface IFileInfo {
  name: string;
  isDir: boolean;
  extName: string;
  path: string;
}

//TODO：安全性问题：访问文件系统前检查是否访问的是进程所在路径下。

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
      const elementPath = this.getPath(`${dir}/${e}`);
      return new Promise((resolve) => {
        fs.stat(elementPath).then((result) => {
          const ret: IFileInfo = {
            name: e,
            isDir: result.isDirectory(),
            extName: extname(elementPath),
            path: elementPath,
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

  /**
   * 新建文件夹
   * @param src 文件夹建立目录，必须用 path 处理过。
   * @param dirName 文件夹名称
   */
  async mkdir(src, dirName) {
    return await fs.mkdir(join(src, dirName));
  }

  /**
   * 将字符串路径解析
   * @param rawPath 字符串路径
   */
  getPath(rawPath: string) {
    return join(...rawPath.split('/'));
  }

  /**
   * 对文件进行重命名
   * @param path 文件原路径
   * @param newName 新文件名
   */
  async renameFile(path: string, newName: string) {
    // 取出旧文件的路径
    const oldPath = join(...path.split(/[\/\\]/g));
    const pathAsArray = path.split(/[\/\\]/g);
    const newPathAsArray = pathAsArray.slice(0, pathAsArray.length - 1);
    const newPath = join(...newPathAsArray, newName);
    return await new Promise((resolve) => {
      fs.rename(oldPath, newPath)
        .then(() => resolve('File renamed!'))
        .catch(() => resolve('File not exist!'));
    });
  }

  /**
   * 删除文件
   * @param path 文件路径
   */
  async deleteFile(path: string) {
    return await new Promise((resolve) => {
      this.logger.log(path);
      fs.unlink(path)
        .then(() => resolve('File Deleted'))
        .catch(() => resolve('File not exist!'));
    });
  }

  /**
   * 创建一个空文件
   * @param path 文件路径
   */
  async createEmptyFile(path: string) {
    return await new Promise((resolve) => {
      fs.writeFile(path, '')
        .then(() => resolve('created'))
        .catch(() => resolve('path error or no right.'));
    });
  }

  /**
   * 读取文本文件
   * @param path 要读取的文本文件路径
   */
  async readTextFile(path: string) {
    return await new Promise((resolve) => {
      fs.readFile(path)
        .then((r) => resolve(r.toString()))
        .catch(() => resolve('file not exist'));
    });
  }
}
