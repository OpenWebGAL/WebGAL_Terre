export function checkFileName(name: string): boolean {
  return name.search(/[\/\\\:\*#%&\?@"\<\>\|]/) === -1;
}