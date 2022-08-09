import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSideBar";
import EditorSidebarControl from "./EditorSidebar/EditorSidebarControl";
import { useSelector } from "react-redux";
import { RootState } from "../../store/origineStore";
import { sidebarTag } from "../../store/statusReducer";
import MainArea from "./MainArea/MainArea";

export default function Editor() {
  const isShowDashboard = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  return <>
    {!isShowDashboard && <div className={styles.editor}>
      <TopBar />
      <div className={styles.container}>
        <EditorSidebarControl />
        <EditorSideBar />
        <MainArea />
      </div>
    </div>}
  </>;
}
