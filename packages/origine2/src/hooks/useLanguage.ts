import { logger } from '@/utils/logger';
import useEditorStore from '@/store/useEditorStore';
import {useEffect} from 'react';
import {i18nActivate} from "@/main";

export default function useLanguage() {
  const language = useEditorStore.use.language();

  useEffect(
    () => {
      logger.info('设置语言: ' + language);
      i18nActivate(language);
    },
    [language]
  );
}
