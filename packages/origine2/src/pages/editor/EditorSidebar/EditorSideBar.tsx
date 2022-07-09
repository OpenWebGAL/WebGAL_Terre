import styles from "./editorSideBar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";


export default function EditorSideBar() {
  const state = useSelector((state: RootState) => state.status.editor);
  return <div className={styles.editor_sidebar}>
    {state.showPreview && <div className={styles.preview_container}>
      <div className={styles.preview_title}>游戏预览</div>
      {/* eslint-disable-next-line react/iframe-missing-sandbox */}
      <iframe id="gamePreviewIframe" frameBorder="0" className={styles.previewWindow} src={`/games/${state.currentEditingGame}`} />
    </div>}
  </div>;
}
