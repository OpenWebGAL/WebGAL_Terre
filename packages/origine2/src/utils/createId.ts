import { v4 as uuidv4 } from 'uuid';

export function createId(): string {
  return uuidv4();
}
