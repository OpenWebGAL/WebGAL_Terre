import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import { useEffect, useState } from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import { Switch } from "antd";
import ChooseFile from "../chooseFile";
import {sendWsSync} from "../../../../util/sendWsSync";

const Bgm = (props) => {
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

    const bgmCheckBoxNo = (checked) => {
        runtime.currentSceneSentenceList[props.index].noBgm = checked;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }


    // const [bgmName, setBgmName] = useState(props.data.bgm);

    const setConstructor = () => {
        return (value) => {
            runtime.currentSceneSentenceList[props.index].bgm = value;
            store.set('writeScene', !store.get('writeScene'));
            sync();
        }
    }

    //语句编辑的UI
    return <div key={props.index + 'bgm'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index + 1} */}
                更改音乐</div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel} />
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>关闭背景音乐</span>
                <span className={styles.optionContent}>
                    <Switch size={'small'} id={'bgm_none' + props.index} checked={props.data.noBgm} onChange={bgmCheckBoxNo} />
                    （将关闭背景音乐）
                </span>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>背景音乐文件</span>
                <ChooseFile setShow={()=>{}} id={'bgmPicker'} dir={'bgm'} set={setConstructor()} />
                <span className={styles.optionContent}>{props.data.bgm}</span>
            </div>
        </main>
    </div>
}

export default Bgm;
