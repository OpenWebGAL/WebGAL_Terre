import { useTranslation } from 'react-i18next';
import { IFormat } from './useVarTrans';

interface IFormatKey {
  key: string;
  format: IFormat;
}

type IKey = string | IFormatKey;

/**
 * @param prefix 翻译时自动添加的前缀
 * @returns 翻译函数, 输入key时会自动添加前缀, "$" 开头则不填加. 输入多个 key 则会返回翻译数组.
 */
export default function useTrans(prefix?: string) {
  const { t } = useTranslation();
  const trans = (transKey: IKey) => {
    const isString = typeof transKey === 'string';
    const key = isString ? transKey : transKey.key;
    const format = isString ? undefined : transKey.format;
    
    return t(key[0] === '$' ? key.slice(1) : prefix + key, format as any) as unknown as string;
  };

  function translation(key: IKey): string;
  function translation(key: IKey, ...keys: IKey[]): string[];
  function translation(key: IKey, ...keys: IKey[]) {
    if (keys.length) return [trans(key), ...keys.map((v) => trans(v))];
    return trans(key);
  }

  return translation;
}
