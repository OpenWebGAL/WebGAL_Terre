import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";
import {useEffect, useState} from "react";
import styles from './sentence.module.scss'
import ControlPanel from "./controlPanel";
import {Switch} from "antd";
import ChooseFile from "../chooseFile";
import {Select} from 'antd';
import {sendWsSync} from "../../../../util/sendWsSync";
import {aniList} from "./functions/aniList";

const {Option} = Select;

const SetAnimation = (props) => {
    const sync = () => sendWsSync(props.index);
    const [showAddPre, setShowAddPre] = useState(false);
    const [showAddAfter, setShowAddAfter] = useState(false);

    //生成前序和后序index
    const indexPre = props.index;
    const indexAfter = props.index + 1;

    const propsToPanel = {showAddPre, setShowAddPre, showAddAfter, setShowAddAfter, indexPre, indexAfter};

    //用于控制语句内容的变更
    useEffect(() => {
        document.getElementById('animationTimeInput' + props.index).value = props.data.duration.toString();
    })

    //传递变化的结果
    const updateThis = () => {
        runtime.currentSceneSentenceList[props.index].duration = document.getElementById('animationTimeInput' + props.index).value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const changeTarget = (value) => {
        runtime.currentSceneSentenceList[props.index].target = value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const changeAniName = (value) => {
        runtime.currentSceneSentenceList[props.index].animationName = value;
        store.set('writeScene', !store.get('writeScene'));
        sync();
    }

    const showAniList = aniList.map((e)=>{
        return <Option key={e} value={e.value}>{e.name}</Option>
    })

    //语句编辑的UI
    return <div key={props.index + 'dialog'} className={styles.sentence}>
        <div className={styles.topContainer}>
            <div className={styles.sentenceIndexShow}>
                {/* #{props.index+1}  */}
                设置动画
            </div>
            <div className={styles.barContainer}>
                <ControlPanel index={props.index} data={propsToPanel}/>
            </div>
        </div>
        <main className={styles.mainEdit}>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>提示：先设置背景/立绘，然后才能设置动画。</span>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>设置动画目标</span>
                <Select size={'small'} defaultValue={props.data.target} style={{width: 120}} onChange={changeTarget}>
                    <Option value="left">左侧立绘</Option>
                    <Option value="center">中间立绘</Option>
                    <Option value="right">右侧立绘</Option>
                    <Option value="bg">背景</Option>
                </Select>
                <span>{'\u00A0\u00A0\u00A0'}</span>
                <span className={styles.optionTitle}>设置动画预设</span>
                <Select size={'small'} defaultValue={props.data.animationName} style={{width: 240}} onChange={changeAniName}>
                    {showAniList}
                </Select>
            </div>
            <div className={styles.singleOption}>
                <span className={styles.optionTitle}>动画执行时间</span>
                <input style={{maxWidth:'100px'}} className={styles.dialog_input} onBlur={updateThis} id={'animationTimeInput' + props.index}/>
                <span style={{padding: '0 0 0 5px'}}>s</span>
            </div>
        </main>
    </div>
}

export default SetAnimation;
