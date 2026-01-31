import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { basename, dirname, extname, join } from 'path';

export interface IFileInfo {
  name: string;
  isDir: boolean;
  extName: string;
  path: string;
  size?: number;
  lastModified?: number;
}

export interface IUploadFileInfo {
  fileName: string;
  file: Buffer;
}

interface FileList {
  fileName: string;
  file: Buffer;
}

//TODO：安全性问题：访问文件系统前检查是否访问的是进程所在路径下。

@Injectable()
export class WebgalFsService {
  constructor(private readonly logger: ConsoleLogger) {}

  static checkFileName(name: string): boolean {
    return name.search(/[\/\\\:\*\?"\<\>\|]/) === -1;
  }

  greet() {
    this.logger.log('Welcome to WebGAl Files System Service!');
  }

  /**
   * 获取目录下文件信息
   * @param dir 目录，需用 path 处理。
   */
  async getDirInfo(_dir: string): Promise<IFileInfo[]> {
    const dir = decodeURI(_dir);
    const fileNames = await fs.readdir(dir);
    const dirInfoPromises = fileNames.map((e) => {
      const elementPath = this.getPath(`${dir}/${e}`);
      return new Promise<IFileInfo>((resolve) => {
        fs.stat(elementPath).then((result) => {
          const ret: IFileInfo = {
            name: e,
            isDir: result.isDirectory(),
            extName: extname(elementPath),
            path: elementPath,
            size: result.isDirectory() ? 0 : result.size,
            lastModified: result.mtimeMs,
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
  async copy(src: string, dest: string): Promise<boolean> {
    try {
      await fs.cp(decodeURI(src), decodeURI(dest), { recursive: true });
      return true;
    } catch (error) {
      this.logger.error('Copy file failed');
      return false;
    }
  }

  /**
   * 将字符串路径解析，根目录是进程运行目录
   * @param rawPath 字符串路径
   */
  getPathFromRoot(rawPath: string) {
    return join(process.cwd(), ...decodeURI(rawPath).split('/'));
  }

  /**
   * 新建文件夹
   * @param src 文件夹建立目录，必须用 path 处理过。
   * @param dirName 文件夹名称
   */
  async mkdir(src, dirName) {
    if (!WebgalFsService.checkFileName(dirName)) return false;

    return await fs
      .mkdir(join(decodeURI(src), decodeURI(dirName)))
      .catch(() => {
        this.logger.log('跳过文件夹创建');
      });
  }

  /**
   * 将字符串路径解析
   * @param rawPath 字符串路径
   */
  getPath(_rawPath: string) {
    const rawPath = decodeURI(_rawPath);
    if (rawPath[0] === '/') {
      return join('/', ...rawPath.split('/'));
    }
    return join(...rawPath.split('/'));
  }

  /**
   * 对文件进行重命名
   * @param path 文件原路径
   * @param newName 新文件名
   */
  async renameFile(path: string, newName: string) {
    if (!WebgalFsService.checkFileName(newName)) return false;
    // 取出旧文件的路径
    const rawOldPath = decodeURI(path);
    let oldPath = join(...rawOldPath.split(/[\/\\]/g));
    const pathAsArray = path.split(/[\/\\]/g);
    const newPathAsArray = pathAsArray.slice(0, pathAsArray.length - 1);
    let newPath = join(...newPathAsArray, decodeURI(newName));
    if (rawOldPath.startsWith('/')) {
      newPath = '/' + newPath;
      oldPath = '/' + oldPath;
    }

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
      fs.unlink(decodeURI(path))
        .then(() => resolve('File Deleted'))
        .catch(() => resolve('File not exist!'));
    });
  }

  /**
   * 删除文件或目录
   * @param path
   */
  async deleteFileOrDirectory(_path: string): Promise<boolean> {
    try {
      const path = decodeURI(_path);

      const stat = await fs.stat(path);

      if (stat.isDirectory()) {
        const files = await fs.readdir(path);
        await Promise.all(
          files.map(async (file) => {
            const filePath = `${path}/${file}`;
            await this.deleteFileOrDirectory(filePath);
          }),
        );
        await fs.rmdir(path);
      } else {
        await fs.unlink(path);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 重命名文件或目录
   * @param path
   * @param newName
   */
  async renameFileOrDirectory(
    _path: string,
    newName: string,
  ): Promise<boolean> {
    if (!WebgalFsService.checkFileName(newName)) return false;
    try {
      const path = decodeURI(_path);

      const dir = path.substr(0, path.lastIndexOf('/') + 1);
      const newPath = dir + decodeURI(newName);

      await fs.rename(path, newPath);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  async exists(_path: string): Promise<boolean> {
    const path = decodeURI(_path);

    return await fs
      .stat(path)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * 检查文件夹是否存在
   * @param path 文件夹路径
   * @returns
   */
  async existsDir(path: string): Promise<boolean> {
    return await fs
      .stat(path)
      .then((stats) => stats.isDirectory())
      .catch(() => false);
  }

  /**
   * 创建一个空文件
   * @param path 文件路径
   */
  async createEmptyFile(path: string) {
    try {
      const decodedPath = decodeURI(path);
      if (
        decodedPath
          .replace(/\\/g, '/')
          .split('/')
          .every((name) => WebgalFsService.checkFileName(name))
      )
        throw new Error('There are unexpect marks in path');
      const directory = dirname(decodedPath);

      if (!(await this.existsDir(directory))) {
        await fs.mkdir(directory, { recursive: true });
      }

      await fs.writeFile(decodedPath, '');
      return 'created';
    } catch (error) {
      this.logger.error(`创建文件失败: ${error.message}`);
      return 'path error or no right.';
    }
  }

  /**
   * 更新文本
   * @param path 要更新的文本的路径
   * @param content 文本内容
   */
  async updateTextFile(path: string, content: string) {
    return await new Promise(async (resolve) => {
      fs.writeFile(decodeURI(path), content)
        .then(() => resolve('Updated.'))
        .catch(() => resolve('path error or no right.'));
    });
  }
  /**
   * 替换文本文件中的文本
   * @param path 文件路径
   * @param text 要替换的文本
   * @param newText 替换后的文本
   */
  async replaceTextFile(
    _path: string,
    text: RegExp | string | RegExp[] | string[],
    newText: string | string[],
  ) {
    try {
      const path = decodeURI(_path);

      const textFile: string | unknown = await this.readTextFile(path);

      if (typeof textFile === 'string') {
        let newTextFile: string = textFile;
        if (typeof text === 'string' && typeof newText === 'string') {
          newTextFile = newTextFile.replace(new RegExp(text, 'g'), newText);
        } else if (text instanceof RegExp && typeof newText === 'string') {
          newTextFile = newTextFile.replace(text, newText);
        } else if (text instanceof Array && typeof newText === 'string') {
          text.map((item) => {
            newTextFile = newTextFile.replace(new RegExp(item, 'g'), newText);
          });
        } else if (
          text instanceof Array &&
          text instanceof Array &&
          text.length === newText.length
        ) {
          text.map((item: RegExp | string, index: number) => {
            newTextFile = newTextFile.replace(
              item instanceof RegExp ? item : new RegExp(item, 'g'),
              newText[index],
            );
          });
        } else return false;

        return await new Promise((resolve) => {
          fs.writeFile(path, newTextFile)
            .then(() => resolve('Replaced.'))
            .catch(() => resolve('Path error or no text'));
        });
      } else return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 读取文本文件
   * @param path 要读取的文本文件路径
   */
  async readTextFile(path: string) {
    return await new Promise((resolve) => {
      fs.readFile(decodeURI(path))
        .then((r) => resolve(r.toString()))
        .catch(() => resolve('file not exist'));
    });
  }

  async writeFiles(
    _targetDirectory: string,
    fileList: FileList[],
  ): Promise<boolean> {
    try {
      const targetDirectory = decodeURI(_targetDirectory);
      await fs.mkdir(this.getPathFromRoot(targetDirectory), {
        recursive: true,
      });
      for (const file of fileList) {
        await fs.writeFile(
          `${this.getPathFromRoot(targetDirectory)}/${decodeURI(
            file.fileName,
          )}`,
          file.file,
        );
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * 复制文件并以“原文件名_编号.扩展名”方式增量保存
   */
  async copyFileWithIncrement(filePath: string): Promise<string> {
    const dir = dirname(filePath);
    const ext = extname(filePath);
    const base = basename(filePath, ext);

    // 读取目录下所有文件
    const files = await fs.readdir(dir);
    // 匹配类似 xxx_序号.txt 的文件
    const regex = new RegExp(`^${base}_(\\d{3})${ext.replace('.', '\\.')}$`);
    let maxNum = 0;
    for (const file of files) {
      const match = file.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    const newName = `${base}_${nextNum}${ext}`;
    const newPath = join(dir, newName);

    await fs.copyFile(filePath, newPath);
    return newPath;
  }
}
