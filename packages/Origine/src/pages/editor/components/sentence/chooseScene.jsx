import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import { useEffect, useState } from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import ChooseFile from "../chooseFile";
import { AddFour, DoubleRight } from "@icon-park/react";
import {sendWsSync} from "../../../../util/sendWsSync";

const ChooseScene = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = { showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter };

    //用于控制语句内容的变更
    useEffect(() => {
        for (let i = 0; i < props.data.chooseItem.length; i++) {
            document.getElementById('chooseInput' + props.index + 'itemIndex' + i).value = props.data.chooseItem[i].text;
        }
    })

    const addChooseItem = () => {
        runtime.currentSceneSentenceList[props.index].chooseItem.push({
            text: '在此填入分支的名称',
            scene: '',
        });
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const updateText = (id) => {
        const updateIndex = parseInt(id.split('Index')[1]);
        console.log(updateIndex);
        runtime.currentSceneSentenceList[props.index].chooseItem[updateIndex].text = document.getElementById(id).value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const setConstructor = (index) => {
        return (value) => {
            runtime.currentSceneSentenceList[props.index].chooseItem[index].scene = value;
            store.set('writeScene', !store.get('writeScene'));
            sync();
        }
    }

    //构造每一个分支的选项列表
    let ChooseItemList = [];
    let chooseItemIndex = 0;
    for (const e of props.data.chooseItem) {
        const inputId = 'chooseInput' + props.index + 'itemIndex' + chooseItemIndex;
        let temp = <div key={chooseItemIndex} className={styles.singleOption}>
            <span className={styles.optionTitle}>分支名称</span>
            <input className={styles.dialog_input} style={{ width: '200px' }} onBlur={() => {
                updateText(inputId);
            }}
                id={inputId} />
            <span className={styles.optionContent}><DoubleRight theme="outline" size="24" fill="#333" /></span>
            <span className={styles.optionTitle}>跳转的场景</span>
            <ChooseFile id={'scenePicker'} dir={'scene'} set={setConstructor(chooseItemIndex)} />
            <span className={styles.optionContent}>{e.scene}</span>
        </div>
        ChooseItemList.push(temp);
        chooseItemIndex++;
    }

    //语句编辑的UI
    return <div key={props.index + 'choose'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index + 1} */}
                分支选择</div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel} />
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div style={{ display: 'flex', padding: '5px 0 0 0' }}>
                <div onClick={addChooseItem} className={styles.sentenceButton}>
                    <AddFour theme="outline" size="16" fill="#333" style={{ padding: '0 5px 0 0' }} />添加分支
                </div>
            </div>
            {ChooseItemList}
        </main>
    </div>
}

export default ChooseScene;
