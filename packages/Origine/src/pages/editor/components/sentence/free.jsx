import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import {useEffect, useState} from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import {Switch} from "antd";
import ChooseFile from "../chooseFile";
import {sendWsSync} from "../../../../util/sendWsSync";

const Free = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = {showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter};

    //用于控制语句内容的变更
    useEffect(() => {
        document.getElementById('contentInput' + props.index).value = props.data.content;
    })

    //传递变化的结果
    const updateThis = () => {
        runtime.currentSceneSentenceList[props.index].content = document.getElementById('contentInput' + props.index).value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    //语句编辑的UI
    return <div key={props.index + 'free'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                自由指令
            </div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel}/>
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <div className={styles.dialog_edit_title}>提示：请访问 <a href={"https://docs.msfasr.com/guide/"}>说明文档</a> 以使用编辑器未支持的脚本语句。</div>
            </div>
            <div className={styles.singleOption}>
                <div className={styles.dialog_edit_title}>注意：请书写单行指令，多于一行的指令会被忽略。</div>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.dialog_edit_title}>指令：</span>
                <textarea className={styles.dialog_input} onBlur={updateThis} id={'contentInput' + props.index}/>
            </div>
        </main>
    </div>
}

export default Free;
