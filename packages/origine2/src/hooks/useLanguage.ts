import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useGenSyncRef } from './useGenSyncRef';
import { language } from '@/store/statusReducer';
import { RootState } from '@/store/origineStore';
import { logger } from '@/utils/logger';
import { setLanguage } from '@/store/statusReducer';

export function getLanguageName(lang: language): string {
  switch (lang) {
  case language.zhCn:
    return 'zhCn';
  case language.en:
    return 'en';
  case language.jp:
    return 'jp';
  }
}

export default function useLanguage(): (lang?: language) => void {
  const { i18n } = useTranslation();
  const GlobalStatesRef = useGenSyncRef((state: RootState) => state.status);
  const dispatch = useDispatch();

  return (_lang?: language) => {
    const lang = (Number.isNaN(_lang) ? null : _lang) ?? GlobalStatesRef.current?.editor.language ?? language.zhCn;

    const languageName = getLanguageName(lang);
    i18n.changeLanguage(languageName);

    dispatch(setLanguage(lang));
    logger.info('设置语言: ' + languageName);
  };
}
