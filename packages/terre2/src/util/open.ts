import open = require('open');
import * as process from 'process';

export function _open(target: string) {
  try {
    if (process.platform === 'win32') open(target);
    if (process.platform === 'darwin') open(target);
    if (process.platform === 'linux') open(target);
  } catch (_) {};
}
