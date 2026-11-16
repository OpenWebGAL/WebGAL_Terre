export function checkFileName(name: string): boolean {
  return name.search(/[\/\\\:\*#%&\?@"\<\>\|]/) === -1;
}

export function hasTrailingDotOrSpace(name: string): boolean {
  return /[. ]$/.test(name);
}