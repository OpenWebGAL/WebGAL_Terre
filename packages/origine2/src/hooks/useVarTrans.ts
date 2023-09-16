import { useTranslation } from 'react-i18next';

export type IFormat = Record<string, string>;

/**
 * @param prefix 翻译时自动添加的前缀
 * @returns 翻译函数, 输入key时会自动添加前缀, "$" 开头则不填加. 输入多个 key 则会返回翻译数组.
 */
export default function useVarTrans(prefix?: string) {
  const { t } = useTranslation();
  const trans = (key: string, format?: IFormat) => t(key[0] === '$' ? key.slice(1) : prefix + key, format as any);

  function translation<T extends string | [string, ...string[]]>(key: T, format?: IFormat): T {
    if (typeof key === 'string') return trans(key, format) as unknown as T;
    return key.map(k => trans(k, format)) as unknown as T;
  }

  return translation;
}