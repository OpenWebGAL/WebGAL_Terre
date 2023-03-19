import styles from "./commonTips.module.scss";

export default function CommonTips({ text }: { text: string }) {
  return <div className={styles.tips}>
    {text}
  </div>;
}
