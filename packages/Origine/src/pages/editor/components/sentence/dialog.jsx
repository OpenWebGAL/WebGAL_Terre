import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import {useEffect, useState} from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import {Switch} from "antd";
import ChooseFile from "../chooseFile";
import {sendWsSync} from "../../../../util/sendWsSync";

const Dialog = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = {showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter};

    //用于控制语句内容的变更
    useEffect(() => {
        document.getElementById('speakerInput' + props.index).value = props.data.speaker;
        document.getElementById('contentInput' + props.index).value = props.data.content;
        // document.getElementById('dialog_pbms' + props.index).checked = props.data.ignoreSpeaker;
    })

    //传递变化的结果
    const updateThis = () => {
        runtime.currentSceneSentenceList[props.index].speaker = document.getElementById('speakerInput' + props.index).value;
        runtime.currentSceneSentenceList[props.index].content = document.getElementById('contentInput' + props.index).value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const dialogCheckBoxUpdate = (checked) => {
        runtime.currentSceneSentenceList[props.index].ignoreSpeaker = checked;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    // const [vocalName, setVocalName] = useState(props.data.vocal);

    const setConstructor = () => {
        return (value) => {
            runtime.currentSceneSentenceList[props.index].vocal = value;
            store.set('writeScene', !store.get('writeScene'));
            sync();
        }
    }

    //语句编辑的UI
    return <div key={props.index + 'dialog'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index+1}  */}
                基本对话
            </div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel}/>
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <span className={styles.dialog_edit_title}>角色：</span>
                <input className={styles.dialog_input} onBlur={updateThis} id={'speakerInput' + props.index}/>
                <span style={{padding: '0 0 0 5px'}}>提示：留空可以继承上一条对话的角色名</span>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.dialog_edit_title}>对话：</span>
                <textarea className={styles.dialog_input} onBlur={updateThis} id={'contentInput' + props.index}/>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>旁白模式</span>
                <span className={styles.optionContent}>
                    <Switch size={'small'} id={'dialog_pbms'} checked={props.data.ignoreSpeaker}
                            onChange={dialogCheckBoxUpdate}/>
                （将不会显示角色名）
                </span>
                <div className={styles.optionTitle}>配音文件</div>
                <ChooseFile setShow={()=>{}} id={'vocalPicker'} dir={'vocal'} set={setConstructor()}/>
                <span className={styles.optionContent}>{props.data.vocal}</span>
            </div>
        </main>

    </div>
}

export default Dialog;
