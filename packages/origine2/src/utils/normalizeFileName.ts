const normalizeFileName = (filename: string): string => {
  const normalized = filename.trim().replace(/[<>《》:：“”'"?？!！/\\|@#%&\s]+/g, '-').trim();
  return normalized.replace(/^_+|_+$/g, '');
};

export default normalizeFileName;
