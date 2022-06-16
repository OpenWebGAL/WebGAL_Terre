import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import { useEffect, useState } from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import { Switch } from "antd";
import ChooseFile from "../chooseFile";
import {sendWsSync} from "../../../../util/sendWsSync";

const Bg = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = { showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter };

    //用于控制语句内容的变更
    useEffect(() => {
        // document.getElementById('bg_next' + props.index).checked = props.data.next;
        // document.getElementById('bg_none' + props.index).checked = props.data.noBg;
    })

    //传递变化的结果
    // const updateThis = () => {
    //     runtime.currentSceneSentenceList[props.index].speaker = document.getElementById('speakerInput' + props.index).value;
    //     runtime.currentSceneSentenceList[props.index].content = document.getElementById('contentInput' + props.index).value;
    //     store.set('writeScene', !store.get('writeScene'));
    // }

    const bgCheckBoxNo = (checked) => {
        runtime.currentSceneSentenceList[props.index].noBg = checked;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const bgCheckBoxNext = (checked) => {
        runtime.currentSceneSentenceList[props.index].next = checked;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    // const [bgName, setBgName] = useState(props.data.bg);

    const setConstructor = () => {
        return (value) => {
            runtime.currentSceneSentenceList[props.index].bg = value;
            store.set('writeScene', !store.get('writeScene'));
            sync();
        }
    }

    //语句编辑的UI
    return <div key={props.index + 'bg'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index + 1}  */}
                更改背景</div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel} />
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>关闭背景</span>
                <span className={styles.optionContent}>
                    <Switch size={'small'} checked={props.data.noBg} id={'bg_none' + props.index} onChange={bgCheckBoxNo} />
                    （将关闭背景）
                </span>
                <span className={styles.optionTitle}>更改背景后继续下一句</span>
                <span className={styles.optionContent}>
                    <Switch size={'small'} id={'bg_next' + props.index} checked={props.data.next} onChange={bgCheckBoxNext} />
                </span>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>背景文件</span>
                <ChooseFile setShow={()=>{}} id={'bgPicker'} dir={'background'} set={setConstructor()} />
                <span className={styles.optionContent}>{props.data.bg}</span>
            </div>
        </main>

    </div>
}

export default Bg;
