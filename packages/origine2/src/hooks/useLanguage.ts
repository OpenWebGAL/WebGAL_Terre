import { useTranslation } from 'react-i18next';
import { logger } from '@/utils/logger';
import useEditorStore from '@/store/useEditorStore';
import {useEffect} from 'react';
import {i18nActivate} from "@/main";

export default function useLanguage() {
  const { i18n } = useTranslation();
  const language = useEditorStore.use.language();

  useEffect(
    () => {
      logger.info('设置语言: ' + language);
      i18n.changeLanguage(language);
      i18nActivate(language);
    },
    [language]
  );
}
