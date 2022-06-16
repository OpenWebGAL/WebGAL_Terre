import styles from './topBar.module.scss'
import {LeftSmall} from "@icon-park/react";
import store from "../../store/editorStore";
import axios from "axios";
import runtime from "../../../../env/runtime";
import {message} from "antd";

const TopBar = () => {

    const ejectGame = (platform) => {
        axios.post(runtime.domain + '/api/manageGame/export', {
            gameName: runtime.currentEditGame,
            platform: platform
        }).then(res => {
            console.log(res.data);
            message.success('游戏已被导出至 ' + `Exported_Games/${runtime.currentEditGame}/${platform}`).then();
        });
    }

    return <div className={styles.nav}>
        <LeftSmall theme="filled" size="30" fill="#333" className={styles.titleIcon} onClick={() => {
            store.set('isManagement', true);
        }}/>
        <div className={styles.title}>WebGAL ORIGINE</div>
        <div style={{marginLeft: 'auto'}} className={styles.ejectButon} onClick={() => {
            ejectGame('web');
        }}>导出游戏为网页
        </div>
        <div className={styles.ejectButon} onClick={() => {
            ejectGame('electron-windows');
        }}>导出游戏为可执行文件
        </div>
    </div>
}

export default TopBar;
