import styles from './sceneEditor.module.scss'
import {useEffect, useState} from "react";
import store from "../../store/editorStore";
import runtime from "../../../../env/runtime";
import axios from "axios";
import {Avatar, Change, Comment, FileMusic, ListView, Pic, Plus, SplitTurnDownRight, Video} from "@icon-park/react";
import createSentence from "./createSentence";
import sentenceMap from "./sentenceMap";
import 'antd/dist/antd.css';
import {eventSender} from "../../../../util/eventSender";
import {Play} from "@icon-park/react/es";

const SceneEditor = (props) => {
    const [updateScene, setUpdateScene] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        //这个钩子仅用于更新场景（基础钩子）
        store.set('updateScene', updateScene);
        store.connect('updateScene', () => {
            setUpdateScene(store.get('updateScene'));
        }, 'updateSceneFunc');
        //这个钩子用来从文件获取最新的场景文件并更新场景
        store.set('refScene', true);
        store.connect('refScene', () => {
            updateSceneFromFile();
        }, 'refSceneFunc');
        //这个钩子用来写入并更新场景
        if (store.get('writeScene') === undefined)
            store.set('writeScene', true);
        store.connect('writeScene', () => {
            writeSence();
        }, 'writeSceneFunc');
        updateSceneFromFile();
        if (runtime.sceneScrollTop.hasOwnProperty(runtime.currentEditScene)) {
            const restoreScroll = () => {
                document.getElementById('currentSentenceList').scrollTop = runtime.sceneScrollTop[runtime.currentEditScene];
            }
            setTimeout(restoreScroll, 0);
        }
    }, []);


    //开始生成元素
    let showSentenceList = [];
    const showSentenceGenerateArray = JSON.parse(JSON.stringify(runtime.currentSceneSentenceList));
    console.log('重新渲染')
    console.log(showSentenceGenerateArray);
    for (let i = 0; i < showSentenceGenerateArray.length; i++) {
        const sentence = showSentenceGenerateArray[i];
        const temp = sentenceMap(sentence, i);
        //每一个语句的卡片
        const t = <div id={'sentence' + i + runtime.currentEditScene} key={'sentence' + i + runtime.currentEditScene}
                       className={styles.sentence}>
            <div className={styles.lineNumber}>{i + 1}</div>
            <div className={styles.sentenceMain}>{temp}</div>
        </div>
        showSentenceList.push(t);
    }

    const showAddSentence = <div className={styles.addSentencePanel_main}>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('dialog');
            setShowAdd(false);
        }}><Comment className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                    style={{padding: '0 5px 0 0'}}/>添加对话
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('changeP');
            setShowAdd(false);
        }}><Avatar className={styles.addItemIcon} theme="outline" size='18' fill="#333" style={{padding: '0 5px 0 0'}}/>切换立绘
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('bg');
            setShowAdd(false);
        }}><Pic className={styles.addItemIcon} theme="outline" size='18' fill="#333" style={{padding: '0 5px 0 0'}}/>切换背景
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('changeScene');
            setShowAdd(false);
        }}><Change className={styles.addItemIcon} theme="outline" size='18' fill="#333" style={{padding: '0 5px 0 0'}}/>场景跳转
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('choose');
            setShowAdd(false);
        }}><SplitTurnDownRight className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                               style={{padding: '0 5px 0 0'}}/>分支选择
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('bgm');
            setShowAdd(false);
        }}><FileMusic className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                      style={{padding: '0 5px 0 0'}}/>背景音乐
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('video');
            setShowAdd(false);
        }}><Video className={styles.addItemIcon} theme="outline" size='18' fill="#333" style={{padding: '0 5px 0 0'}}/>插入视频
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('intro');
            setShowAdd(false);
        }}><ListView className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                     style={{padding: '0 5px 0 0'}}/>黑屏文字
        </div>
        <div className={styles.addSentenceButton} onClick={() => {
            createNewSentence('setAnimation', props.index);
            setShowAdd(false);
        }}><Play className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                     style={{padding: '0 5px 0 0'}}/>设置动画
        </div>
    </div>


    return <div className={styles.main} key={runtime.currentEditScene} id={runtime.currentEditScene}>
        <div className={styles.topButtonList}>
            {/*<div className={styles.topButton} onClick={writeSence}>保存场景</div>*/}
            <div className={styles.topButton} onClick={() => {
                setShowAdd(!showAdd);
            }}>
                <Plus theme="outline" size="24" fill="#fff"/>
            </div>
            <div>{showAdd && showAddSentence}</div>
        </div>
        <div className={styles.sentenceList} id={'currentSentenceList'}>
            {showSentenceList}
        </div>
    </div>

}


function updateSceneFromFile() {
    //读取Scene的数据
    let sceneName = runtime.currentEditScene;
    // if (sceneName === '') {
    //     sceneName = props.sceneName;
    // }
    if (sceneName === '')
        return;
    const url = `${runtime.domain}/Games/${runtime.currentEditGame}/game/scene/${sceneName}`;
    axios.get(url,).then(r => {
        runtime.currentSceneSentenceList = r.data;
        store.set('updateScene', !store.get('updateScene'));
        // if (runtime.isRealtimeRefreashPreview) {
        //     eventSender('refPreviewButton', 0, 0);
        // }
    }).catch(e => console.log(e))
}

function createNewSentence(sentenceType, index) {
    const sentence = createSentence(sentenceType);
    if (index !== undefined) {
        runtime.currentSceneSentenceList.splice(index, 0, sentence);
    } else
        runtime.currentSceneSentenceList.push(sentence);
    writeSence();
}

function writeSence() {
    const url = `${runtime.domain}/api/editGame/editScene/`;
    const data = {
        gameName: runtime.currentEditGame,
        sceneName: runtime.currentEditScene,
        sceneData: runtime.currentSceneSentenceList
    };
    axios.post(url, data).then(r => {
            updateSceneFromFile();
        }
    ).catch(e => console.log(e));
}

export {updateSceneFromFile, createNewSentence, writeSence}

export default SceneEditor;
