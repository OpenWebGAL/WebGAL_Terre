import TopBar from "./Topbar/Topbar";
import styles from "./editor.module.scss";
import EditorSideBar from "./EditorSidebar/EditorSidebar";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/store/origineStore";
import MainArea from "./MainArea/MainArea";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { useHashRoute } from "@/hooks/useHashRoute";
import {statusActions} from "@/store/statusReducer";


export default function Editor() {
  const isShowDashboard = useSelector((state: RootState) => state.status.dashboard.showDashBoard);
  const editorState = useSelector((state: RootState) => state.status.editor);
  const isShowPreview = editorState.showPreview;
  const dispatch = useDispatch();
  const currentTag = editorState.currentSidebarTag;
  useHashRoute();
  const isAutoHideToolbar = useSelector((state:RootState)=>state.userData.isAutoHideToolbar);

  function handleMainAreaClick(){
    if(isAutoHideToolbar){
      dispatch(statusActions.setCurrentTopbarTab(undefined));
    }
  }

  return <>
    {!isShowDashboard && <div className={styles.editor}>
      <TopBar />
      <div className={styles.container} onClick={()=>handleMainAreaClick()}>
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
