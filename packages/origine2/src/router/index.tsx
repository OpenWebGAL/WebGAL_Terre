import { useEffect, type ReactNode } from 'react';
import useEditorStore from '@/store/useEditorStore';
import DashBoard from '@/pages/dashboard/DashBoard';
import GameEditorProvider from '@/pages/editor/GameEditorProvider';
import Editor from '@/pages/editor/Editor';
import TemplateEditorProvider from '@/pages/templateEditor/TemplateEditorProvider';
import TemplateEditor from '@/pages/templateEditor/TemplateEditor';

export type IPage = 'dashboard' | 'game' | 'template';

export const routes: { [key in IPage]: { url: string; element: ReactNode } } = {
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

export function RouterPage({ page }: { page: IPage }) {
  return routes[page].element || routes.dashboard.element;
}

export const goTo = (page: IPage, subPage?: string) => {
  window.location.hash = `${routes[page].url}${subPage ? `/${subPage}` : ''}`;
};

export function useHashRouter() {
  const updatePage = useEditorStore.use.updatePage();
  const updateSubPage = useEditorStore.use.updateSubPage();

  useEffect(() => {
    const handleHashChange = () => {
      const [, _page, _subPage] = window.location.hash.split('/');
      if (['game', 'template'].includes(_page) && _subPage && _subPage.length > 0) {
        updatePage(_page as IPage);
        try {
          updateSubPage(decodeURIComponent(_subPage));
        } catch (error) {
          console.warn('Update sub page error!', error);
          updateSubPage(_page);
          goTo('dashboard', _page);
        }
      } else if (_page === 'dashboard' && ['game', 'template'].includes(_subPage)) {
        updatePage('dashboard');
        updateSubPage(_subPage);
      } else {
        updateSubPage('game');
        goTo('dashboard', 'game');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}
