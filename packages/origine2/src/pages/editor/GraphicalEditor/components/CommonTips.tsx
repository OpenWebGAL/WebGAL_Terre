import styles from "./commonTips.module.scss";
import {CSSProperties} from "react";

export default function CommonTips({text, style}: { text: string, style?: CSSProperties }) {
  return <div className={styles.tips} style={style}>
    {text}
  </div>;
}
