import useEditorStore from "@/store/useEditorStore";
import {useEffect} from "react";

interface RouterMap {
  [key: string]: string;
}

export const routerMap: RouterMap = {
  game: '#game',
  template: '#template',
};

export default function useHashRoute() {
  const updateEditor = useEditorStore.use.updateEditor();
  const updateCurrentEdit = useEditorStore.use.updateCurrentEdit();

  useEffect(
    () => {
      const getHash = () => {
        const [editor, currentEdit] = window.location.hash.slice(1).split('/');
        if (editor === 'game') {
          updateEditor('game');
        } else if (editor === 'template') {
          updateEditor('template');
        } else {
          window.location.hash = routerMap.game;
        }
        (currentEdit && currentEdit.length > 0) 
          ? updateCurrentEdit(decodeURIComponent(currentEdit))
          : updateCurrentEdit('');
      };
      getHash();
      window.addEventListener('hashchange', getHash);
      return () => {
        window.removeEventListener('hashchange', getHash);
      };
    },
    []
  );

}