export const splitToArray = (rawText:string)=>{
  return rawText.replaceAll('\r','').split('\n');
};

export const mergeToString = (stringArray:string[])=>{
  return stringArray.join('\n');
};
