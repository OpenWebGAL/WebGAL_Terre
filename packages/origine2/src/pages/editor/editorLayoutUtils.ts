export const DIVIDER_SIZE = 4;

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const readStorageNumber = (key: string, fallback: number): number => {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return fallback;
};
