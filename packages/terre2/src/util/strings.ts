export function pprintJSON(obj: unknown, needStringify = false) {
  let jsonStr: string;

  if (needStringify) {
    jsonStr = JSON.stringify(obj);
  } else {
    if (typeof obj === 'string') {
      jsonStr = obj;
    } else {
      jsonStr = obj.toString();
    }
  }
  return JSON.stringify(JSON.parse(jsonStr), null, 2);
}
