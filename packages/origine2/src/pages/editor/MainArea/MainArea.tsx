import EditArea from "./EditArea";
import TagsManager from "./TagsManager";
import styles from './mainArea.module.scss';
import { useEffect } from "react";
import {eventBus} from "@/utils/eventBus";

export default function MainArea() {

  return <div className={styles.MainArea_main}>
    <TagsManager/>
    <EditArea/>
  </div>;
}
