import './App.css';
import DashBoard from './pages/dashboard/DashBoard';
import Editor from './pages/editor/Editor';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import '@icon-park/react/styles/index.css';
import './config/themes/theme.css';
import './assets/font-family.css';
import useEditorStore from './store/useEditorStore';
import useHashRoute, { IPage } from './hooks/useHashRoute';
import useLanguage from './hooks/useLanguage';
import TemplateEditor from './pages/templateEditor/TemplateEditor';
import GameEditorProvider from './components/Provider/GameEditorProvider';
import TemplateEditorProvider from './components/Provider/TemplateEditorProvider';
import { eventBus } from '@/utils/eventBus';
import { initMonaco } from "@/utils/initMonaco";

export const routers: { [key in IPage]: { url: string; element: ReactNode } } = {
  dashboard: {
    url: '#/dashboard',
    element: <DashBoard />,
  },
  game: {
    url: '#/game',
    element: (
      <GameEditorProvider>
        <Editor />
      </GameEditorProvider>
    ),
  },
  template: {
    url: '#/template',
    element: (
      <TemplateEditorProvider>
        <TemplateEditor />
      </TemplateEditorProvider>
    ),
  },
};

function App() {
  useEffect(() => {
    initMonaco();
  }, []);

  // 建立 WS 连接
  useEffect(() => {

  }, []);

  useHashRoute();
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
      {routers[page].element || routers.dashboard.element}
    </div>
  );
}

export default App;
