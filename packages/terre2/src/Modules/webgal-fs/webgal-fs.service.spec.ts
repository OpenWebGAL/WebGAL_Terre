import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';
import AdmZip = require('adm-zip');
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

  it('compresses a directory into a zip file path', async () => {
    const sourceDir = join(testRoot, 'source');
    const zipPath = join(testRoot, 'source.zip');
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.writeFile(join(sourceDir, 'template.json'), '{}');

    await expect(
      service.compressedDirectory(sourceDir, zipPath),
    ).resolves.toBe(true);
    expect((await fs.stat(zipPath)).isFile()).toBe(true);
  });

  it('returns null when reading an invalid zip buffer', () => {
    expect(
      service.readFileInZipToBuffer(Buffer.from('not a zip'), 'template.json'),
    ).toBeNull();
  });

  it('rejects zip entries that would escape the target directory', async () => {
    const zip = new AdmZip();
    zip.addFile('../outside.txt', Buffer.from('blocked'));
    const outsidePath = join(testRoot, '..', 'outside.txt');

    try {
      await expect(
        service.decompressedDirectory(zip.toBuffer(), join(testRoot, 'out')),
      ).resolves.toBe(false);
      await expect(fs.stat(outsidePath)).rejects.toBeDefined();
    } finally {
      await fs.rm(outsidePath, { force: true });
    }
  });
});
