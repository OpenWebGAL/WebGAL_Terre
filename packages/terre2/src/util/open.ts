import open = require('open');
import * as process from 'process';

export function _open(target: string) {
  if (process.platform === 'win32') open(target);
}
