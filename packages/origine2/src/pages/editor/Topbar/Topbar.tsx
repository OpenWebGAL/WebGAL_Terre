import styles from "./topbar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";

export default function TopBar() {
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  return <div className={styles.editor_topbar}>
    <div className={styles.editor_title}>WebGAL Origine</div>
    <div className={styles.editor_editingGame}>正在编辑：<span style={{fontWeight:"bold"}}>{editingGame}</span></div>
  </div>;
}
