import styles from './sidebarTags.module.scss';
import axios from "axios";
import { origineStore } from "../../../../store/origineStore";

export default function Assets() {

  function open_assets(){
    axios.get(`/api/manageGame/openGameAssetsDict/${origineStore.getState().status.editor.currentEditingGame}`).then();
  }


  return (
    <div>
      <div className={styles.sidebar_tag_title}>资源管理</div>
      <div className={styles.open_assets} onClick={open_assets}>
        打开此游戏的资源文件夹
      </div>
    </div>
  );
}
