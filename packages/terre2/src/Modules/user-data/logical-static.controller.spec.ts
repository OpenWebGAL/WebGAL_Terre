import * as fs from 'fs/promises';
import * as path from 'path';
import { LogicalStaticController } from './logical-static.controller';

describe('LogicalStaticController', () => {
  const tmpDir = path.join(process.cwd(), 'tmp', 'logical-static-spec');
  const filePath = path.join(tmpDir, 'file.txt');
  let controller: LogicalStaticController;

  beforeEach(async () => {
    controller = new LogicalStaticController();
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(filePath, 'test');
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('does not reject when the client aborts a sendFile request', async () => {
    const res = {
      sendFile: jest.fn((_: string, callback: (error?: Error) => void) => {
        callback(Object.assign(new Error('Request aborted'), {
          code: 'ECONNABORTED',
        }));
      }),
    };

    await expect(sendFile(controller, filePath, res)).resolves.toBeUndefined();
  });

  it('rejects non-abort sendFile errors', async () => {
    const res = {
      sendFile: jest.fn((_: string, callback: (error?: Error) => void) => {
        callback(Object.assign(new Error('Disk read failed'), {
          code: 'EIO',
        }));
      }),
    };

    await expect(sendFile(controller, filePath, res)).rejects.toThrow(
      'Disk read failed',
    );
  });
});

function sendFile(
  controller: LogicalStaticController,
  filePath: string,
  res: { sendFile: jest.Mock },
) {
  return (
    controller as unknown as {
      sendFile(filePath: string, res: { sendFile: jest.Mock }): Promise<void>;
    }
  ).sendFile(filePath, res);
}
