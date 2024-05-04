import {i18n} from "@lingui/core";

export function getMdnLink(prop:string){

  let lang = i18n.locale;
  if(lang === 'zhCn')
    lang = 'zh-CN';

  return `https://developer.mozilla.org/${lang}/docs/Web/CSS/${prop}`;
}
