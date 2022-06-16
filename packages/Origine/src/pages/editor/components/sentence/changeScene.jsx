import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import { useEffect, useState } from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import { Switch } from "antd";
import ChooseFile from "../chooseFile";
import {sendWsSync} from "../../../../util/sendWsSync";

const ChangeScene = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = { showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter };

    //用于控制语句内容的变更
    useEffect(() => {
    })

    // const [sceneName, setSceneName] = useState(props.data.newScene);

    const setConstructor = () => {
        return (value) => {
            runtime.currentSceneSentenceList[props.index].newScene = value;
            store.set('writeScene', !store.get('writeScene'));
            sync();
        }
    }

    //语句编辑的UI
    return <div key={props.index + 'scene'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index+1}  */}
                切换场景</div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel} />
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>新场景</span>
                <ChooseFile setShow={()=>{}} id={'scenePicker'} dir={'scene'} set={setConstructor()} />
                <span className={styles.optionContent}>{props.data.newScene}</span>
            </div>
        </main>
    </div>
}

export default ChangeScene;
