import './App.css';
import { useEffect, useMemo, useState } from 'react';
import '@icon-park/react/styles/index.css';
import './config/themes/theme.css';
import './assets/font-family.css';
import useEditorStore from './store/useEditorStore';
import useLanguage from './hooks/useLanguage';
import { initMonaco } from '@/utils/initMonaco';
import { useHashRouter, RouterPage } from '@/router';

function App() {
  useEffect(() => {
    initMonaco();
  }, []);

  // // 建立 WS 连接
  // useEffect(() => {}, []);

  useHashRouter();
  useLanguage();

  const page = useEditorStore.use.page();
  const subPage = useEditorStore.use.subPage();
  document.title = useMemo(() => `${page !== 'dashboard' ? `${subPage} - ` : ''}WebGAL Terre`, [page, subPage]);
  const language = useEditorStore.use.language();
  const [appKeyLang, setAppKeyLang] = useState(language);

  useEffect(() => {
    setAppKeyLang(language);
  }, [language]);

  return (
    <div className="App" key={appKeyLang}>
      <RouterPage page={page} />
    </div>
  );
}

export default App;
