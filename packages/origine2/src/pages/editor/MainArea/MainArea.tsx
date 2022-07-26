import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import EditArea from "./EditArea";
import TagsManager from "./TagsManager";
import styles from './mainArea.module.scss';

export default function MainArea() {
  // 主区域需要具有标签页管理的功能。
  // Tags 列表可以拖拽。
  // 这个区域没有自主状态。
  return <div className={styles.MainArea_main}>
    <TagsManager/>
    <EditArea/>
  </div>;
}
