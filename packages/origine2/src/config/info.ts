import { version } from '~build/package';
import now from '~build/time';

export interface Info {
  version: string,
  buildTime: Date,
}

export const __INFO: Info = {
  version,
  buildTime: now,
};
