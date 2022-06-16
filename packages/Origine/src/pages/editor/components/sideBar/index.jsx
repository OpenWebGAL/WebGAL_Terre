import styles from './sideBar.module.scss'
import {useEffect, useState} from "react";
import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import GameConfig from "./components/sideBarContent/gameConfig";
import AssetsManagement from "./components/sideBarContent/assetsManagement";
import SceneManagement from "./components/sideBarContent/sceneManagement";
import {FolderOpen, PlayTwo, PreviewClose, PreviewOpen, SettingConfig} from "@icon-park/react";
import {Preview} from "./components/preview/Preview";
import {ChooseIcon} from "./components/chooseIcon/chooseIcon";

const SideBar = () => {
    const sideBarItem = ['游戏配置', '素材管理', '场景管理'];
    const [ref, setRef] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    useEffect(() => {
        store.set('refSideBar', ref);
        store.connect('refSideBar', () => {
            setRef(store.get('refSideBar'))
        }, 'refSideBarFunc')
    }, [])
    //生成选择侧边栏Tag的界面
    const showOption = sideBarItem.map((e, i) => {
        let fill = '#333';
        let icon = <SettingConfig theme="outline" size="14" fill={fill}/>;
        if (e === '素材管理') {
            icon = <FolderOpen theme="outline" size="14" fill={fill}/>
        }
        if (e === '场景管理') {
            icon = <PlayTwo theme="outline" size="14" fill={fill}/>
        }
        return <ChooseIcon onClickFunc={() => {
            if (runtime.editorTag === e) {
                runtime.editorTag = '';
            } else
                runtime.editorTag = e;
            store.set('refSideBar', !store.get('refSideBar'));
        }} key={e} e={e} icon={icon}/>;
    })
    //生成Content界面
    let sideBarConetnt;
    switch (runtime.editorTag) {
        case "游戏配置":
            sideBarConetnt = <GameConfig/>;
            break;
        case "素材管理":
            sideBarConetnt = <AssetsManagement/>;
            break;
        case "场景管理":
            sideBarConetnt = <SceneManagement/>;
            break;
        case "":
            sideBarConetnt = <></>;
            break;
    }

    //显示预览的按钮
    const showPreviewButton = <div
        className={showPreview ? styles.tagButton + ' ' + styles.tagButtonOn : styles.tagButton}
        onClick={() => {
            setShowPreview(!showPreview)
        }}>
        <div>
            {showPreview&&<PreviewOpen theme="outline" size="14" fill="#333"/>}
            {!showPreview&&<PreviewClose theme="outline" size="14" fill="#333"/>}
            <span style={{margin: '0 5px 0 0 '}}/>
        </div>
    </div>

    return <div className={styles.newAsideMain}>
        <div className={styles.newOption}>
            {showPreviewButton}
            {showOption}
        </div>
        <aside className={styles.aside}>
            {showPreview && <Preview/>}
            {runtime.editorTag !== '' && <div className={styles.sideBarMain}>
                <div className={styles.gamePrevTitle}>{runtime.editorTag}</div>
                <div className={styles.sideBarContent}>
                    {sideBarConetnt}
                </div>
            </div>}
        </aside>
    </div>
}

export default SideBar;
