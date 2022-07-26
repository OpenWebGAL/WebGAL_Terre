import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSideBar";
import EditorSidebarControl from "./EditorSidebar/EditorSidebarControl";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import { sidebarTag } from "../../store/statusReducer";
import MainArea from "./MainArea/MainArea";

export default function Editor() {
  const state = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const editorState = useSelector((state: RootState) => state.status.editor);
  return <>
    {!state && <div className={styles.editor}>
      <TopBar />
      <div className={styles.container}>
        <EditorSidebarControl />
        {(editorState.currentSidebarTag !== sidebarTag.none || editorState.showPreview) && <EditorSideBar />}
        <MainArea />
      </div>
    </div>}
  </>;
}
