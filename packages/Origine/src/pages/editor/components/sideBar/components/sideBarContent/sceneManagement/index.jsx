import {useEffect, useState} from "react";
import axios from "axios";
import runtime from "../../../../../../../env/runtime";
import store from "../../../../../store/editorStore";
import AddScene from "./addScene";
import styles from "./sceneManagement.module.scss";
import {AddOne, PlayTwo} from "@icon-park/react";
import recordScroll from "../../../../functions/recordScroll";

const SceneManagement = () => {
    const [sceneList, setSceneList] = useState([]);
    const [showAddScene, setShowAddScene] = useState(false);
    const getSceneList = () => {
        const gameName = runtime.currentEditGame;
        //当前目录。如果当前目录为空，就代表现在是根目录，因此不显示单独的文件，只显示目录
        const currentDir = 'scene';
        const data = {'dir': `/${gameName}/game/${currentDir}`};
        axios.post(`${runtime.domain}/api/editGame/getAssets/`, data).then(r => {
            setSceneList(r.data);
        }).catch(e => {
            console.log(e)
        })
    }

    const addedNewScene = () => {
        getSceneList();
        setShowAddScene(!showAddScene);
    }

    useEffect(() => {
        getSceneList();
    }, [])

    const openSceneEdit = (sceneName) => {
        //首先先查这个Scene有没有被打开
        const isSceneOpened = runtime.currentOpendSceneEdit.includes(sceneName);
        if (isSceneOpened) {
            //什么也不做
        } else {
            runtime.currentOpendSceneEdit.push(sceneName);
        }
        //如果当前打开了场景，记录当前滚动的位置
        recordScroll();
        //改变当前编辑的Scene
        runtime.currentEditScene = sceneName;
        store.set('updateEditor', !store.get('updateEditor'));//通知编辑器更新到最新的环境;
    }

    //用获得的sceneList生成场景列表
    const showSceneList = [];
    for (const e of sceneList) {
        let showThis = false;
        let splitE = e.split('.');
        //检测是不是json场景文件
        if (splitE[splitE.length - 1] === 'json') {
            showThis = true;
        }
        const temp = <div className={styles.scene} key={e} onClick={() => openSceneEdit(e)}>
            <PlayTwo theme="outline" size="16" fill="#333" style={{padding: '0 5px 0 0'}}/>{e}
        </div>
        if (showThis)
            showSceneList.push(temp);
    }


    return <div style={{width:'100%'}}>
        {/*<div className={styles.titleText}>*/}
        {/*    场景管理*/}
        {/*</div>*/}
        <div className={styles.newSceneButton} onClick={() => {
            setShowAddScene(!showAddScene);
        }}>
            <AddOne theme="outline" size="18" fill="#333"
                    style={{padding: '0 5px 0 0', transform: 'translate(0,2px)'}}/>
            新建场景
        </div>
        <div>
            {showAddScene && <AddScene added={addedNewScene}/>}
        </div>
        <div className={styles.sceneList}>
            {showSceneList}
        </div>
    </div>
}
export default SceneManagement
;
