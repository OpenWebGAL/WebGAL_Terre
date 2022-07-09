import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSideBar";
import EditorSidebarControl from "./EditorSidebar/EditorSidebarControl";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import { sidebarTag } from "../../store/statusReducer";

export default function Editor() {
  const state = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const editorState = useSelector((state: RootState) => state.status.editor);
  return <>
    {!state && <div className={styles.editor}>
      <TopBar />
      <div className={styles.editor_mainarea}>
        <EditorSidebarControl />
        {(editorState.currentSidebarTag !== sidebarTag.none || editorState.showPreview) && <EditorSideBar />}
      </div>
    </div>}
  </>;
}
