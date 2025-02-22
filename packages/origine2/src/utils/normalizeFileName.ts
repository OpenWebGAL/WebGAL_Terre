const normalizeFileName = (filename: string): string => {
  const normalized = filename.replace(/[<>《》:：“”'"?？!！/\\|@#%&\s]+/g, '-').trim();
  return normalized.replace(/^_+|_+$/g, '');
};

export default normalizeFileName;
