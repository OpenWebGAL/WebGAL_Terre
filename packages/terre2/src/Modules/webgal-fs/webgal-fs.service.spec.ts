import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import { WebgalFsService } from './webgal-fs.service';

describe('WebgalFsService', () => {
  const testRoot = join(
    process.cwd(),
    'tmp',
    'webgal-fs-service-spec',
    `run-${Date.now()}`,
  );
  let service: WebgalFsService;

  beforeEach(async () => {
    service = new WebgalFsService(new ConsoleLogger());
    await fs.mkdir(testRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  it('allows regular Windows absolute paths in segment validation', () => {
    expect(
      WebgalFsService.hasInvalidPathSegments(
        'C:\\repo\\public\\games\\demo\\scene.txt',
        'win32',
      ),
    ).toBe(false);
  });

  it('rejects invalid marks in path segments', () => {
    expect(
      WebgalFsService.hasInvalidPathSegments(
        'C:\\repo\\public\\games\\bad|name.txt',
        'win32',
      ),
    ).toBe(true);
  });

  it('rejects traversal path segments', () => {
    expect(
      WebgalFsService.hasInvalidPathSegments(
        '/home/app/public/../secret.txt',
        'linux',
      ),
    ).toBe(true);
  });

  it('creates an empty file for valid path', async () => {
    const targetFilePath = join(testRoot, 'valid.txt');
    const ret = await service.createEmptyFile(targetFilePath);
    expect(ret).toBe('created');
    await expect(fs.stat(targetFilePath)).resolves.toBeDefined();
  });

  it('blocks creating files out of workspace', async () => {
    const outsidePath = join(
      resolve(process.cwd(), '..'),
      `webgal-fs-outside-${Date.now()}.txt`,
    );
    const ret = await service.createEmptyFile(outsidePath);
    expect(ret).toBe('path error or no right.');
  });
});
