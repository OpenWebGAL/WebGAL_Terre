import { routers } from "@/App";
import useEditorStore from "@/store/useEditorStore";
import { useEffect } from "react";

export type IPage = 'dashboard' | 'game' | 'template';

export const redirect = (page: IPage, subPage?: string) => {
  window.location.hash = `${routers[page].url}${subPage ? `/${subPage}` : ''}`;
};

export default function useHashRoute() {
  const updatePage = useEditorStore.use.updatePage();
  const updateSubPage = useEditorStore.use.updateSubPage();

  useEffect(
    () => {
      const handleHashChange = () => {
        const [, _page, _subPage] = window.location.hash.split('/');
        if (['game', 'template'].includes(_page) && _subPage && _subPage.length > 0) {
          updatePage(_page as IPage);
          try {
            updateSubPage(decodeURIComponent(_subPage));
          } catch (error) {
            updateSubPage(_page);
            redirect('dashboard', _page);
          }
        } else if (_page === 'dashboard' && ['game', 'template'].includes(_subPage)) {
          updatePage('dashboard');
          updateSubPage(_subPage);
        } else {
          updateSubPage('game');
          redirect('dashboard', 'game');
        }
      };
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    },
    []
  );

}