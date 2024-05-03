import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSidebar";
import MainArea from "./MainArea/MainArea";
import useEditorStore from "@/store/useEditorStore";
import { useGameEditorContext } from "@/store/useGameEditorStore";

export default function Editor() {
  const isAutoHideToolbar = useEditorStore.use.isAutoHideToolbar();
  const updateCurrentTopbarTab = useGameEditorContext((state) => state.updateCurrentTopbarTab);

  const handleMainAreaClick = () => isAutoHideToolbar && updateCurrentTopbarTab(null);

  return (
    <div className={styles.editor}>
      <TopBar />
      <div className={styles.container} onClick={()=>handleMainAreaClick()}>
        <EditorSideBar />
        <MainArea />
      </div>
    </div>
  );
}
