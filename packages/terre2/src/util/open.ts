import { Options } from 'open';
import open = require('open');
import * as process from 'process';

export function _open(target: string, options: Options = {}) {
  try {
    if (process.platform === 'win32') open(target, options);
    if (process.platform === 'darwin') open(target, options);
    if (process.platform === 'linux') open(target, options);
  } catch (_) {}
}
