import styles from "./topbar.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import {  LeftSmall } from "@icon-park/react";

export default function TopBar() {
  const editingGame: string = useSelector((state: RootState) => state.status.editor.currentEditingGame);
  return <div className={styles.editor_topbar}>
    <a href="/" className={styles.home_btn}>
      <LeftSmall theme="outline" size="24" fill="#005caf"/>
      <div className={styles.editor_title}>WebGAL Origine</div>
    </a>

    <div className={styles.editor_editingGame}>正在编辑：<span style={{fontWeight:"bold"}}>{editingGame}</span></div>
  </div>;
}
