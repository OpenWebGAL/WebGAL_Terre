const normalizeFileName = (filename: string): string => {
  const normalized = filename.replace(/[<>《》:：“”'"?？!！/\\|@#%&\s]+/g, '_').trim();
  return normalized.replace(/^_+|_+$/g, '');
};

export default normalizeFileName;
