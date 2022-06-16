import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import { useEffect, useState } from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import { Switch } from "antd";
import ChooseFile from "../chooseFile";
import {AddFour, DoubleRight} from "@icon-park/react";
import {sendWsSync} from "../../../../util/sendWsSync";

const Intro = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = { showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter };

    //用于控制语句内容的变更
    useEffect(() => {
        for (let i = 0; i < props.data.content.length; i++) {
            document.getElementById('introInput' + props.index + 'itemIndex' + i).value = props.data.content[i];
        }
    })

    const addIntroItem = () => {
        runtime.currentSceneSentenceList[props.index].content.push('在此填入要展示的文字');
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const updateText = (id) => {
        const updateIndex = parseInt(id.split('Index')[1]);
        console.log(updateIndex);
        runtime.currentSceneSentenceList[props.index].content[updateIndex] = document.getElementById(id).value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    //构造intro的文字列表
    let ChooseItemList = [];
    let chooseItemIndex = 0;
    for (const e of props.data.content) {
        const inputId = 'introInput' + props.index + 'itemIndex' + chooseItemIndex;
        let temp = <div key={chooseItemIndex} className={styles.singleOption}>
            <span className={styles.optionTitle}>显示文字</span>
            <input className={styles.dialog_input} style={{ width: '200px' }} onBlur={() => {
                updateText(inputId);
            }}
                   id={inputId} />
        </div>
        ChooseItemList.push(temp);
        chooseItemIndex++;
    }

    //语句编辑的UI
    return <div key={props.index + 'intro'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index + 1} */}
                黑屏文字</div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel} />
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div style={{ display: 'flex', padding: '5px 0 0 0' }}>
                <div onClick={addIntroItem} className={styles.sentenceButton}>
                    <AddFour theme="outline" size="16" fill="#333" style={{ padding: '0 5px 0 0' }} />添加文字
                </div>
            </div>
            {ChooseItemList}
        </main>
    </div>
}

export default Intro;
