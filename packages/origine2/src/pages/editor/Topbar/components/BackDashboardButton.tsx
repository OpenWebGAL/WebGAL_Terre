import styles from "./backDashboardButton.module.scss";
import {ChevronLeftFilled} from "@fluentui/react-icons";
import TerreIcon from "@/pages/editor/Topbar/assets/wgfav-new-blue.png";

export default function BackDashboardButton(props: { onClick: () => void }) {
  return <button className={styles.backButton} onClick={props.onClick}>
    <ChevronLeftFilled className={styles.backIcon} />
    <img src={TerreIcon} className={styles.terreImg} height={24} width={24} alt="WebGAL Terre Dashboard"/>
  </button>;
}
