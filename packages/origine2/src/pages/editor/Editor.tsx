import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSidebar";
import EditorSidebarControl from "./EditorSidebar/EditorSidebarControl";
import { useSelector } from "react-redux";
import { RootState } from "@/store/origineStore";
import MainArea from "./MainArea/MainArea";
import { Splitter, SplitterPanel } from "primereact/splitter";


export default function Editor() {
  const isShowDashboard = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const editorState = useSelector((state: RootState) => state.status.editor);
  const isShowPreview = editorState.showPreview;
  const currentTag = editorState.currentSidebarTag;
  return <>
    {!isShowDashboard && <div className={styles.editor}>
      <TopBar />
      <div className={styles.container}>
        <EditorSidebarControl />
        {/* <Splitter style={{ height: "100%", flex: 1 }}> */}
        {/*  <SplitterPanel size={15} minSize={15} */}
        {/*    style={{ display: (isShowPreview || currentTag !== 0) ? undefined : "none" }}><EditorSideBar /></SplitterPanel> */}
        {/*  <SplitterPanel minSize={30}><MainArea /></SplitterPanel> */}
        {/* </Splitter> */}
        <EditorSideBar />
        <MainArea />
      </div>
    </div>}
  </>;
}
