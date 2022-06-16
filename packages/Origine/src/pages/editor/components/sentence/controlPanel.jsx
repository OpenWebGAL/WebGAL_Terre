import styles from './sentence.module.scss'
import {changePos, deleteThis} from "./util";
import {Add, Delete, DownSquare, UpSquare} from "@icon-park/react";
import AddSentenceByIndex from "../sceneEditor/addSentenceByIndex";

const ControlPanel = (props) => {
    return <div className={styles.sentenceButtonList}>
        <div className={styles.sentenceButton} onClick={() => {
            deleteThis(props.index)
        }}>
            <Delete theme="outline" size="14" fill="#333" style={{padding: '0 5px 0 0'}}/>
            删除本句
        </div>
        <div onClick={() => {
            changePos(props.index, -1)
        }} className={styles.sentenceButton}>
            <UpSquare theme="outline" size="14" fill="#333" style={{padding: '0 5px 0 0'}}/>
            上移本句
        </div>
        <div onClick={() => {
            changePos(props.index, 1)
        }} className={styles.sentenceButton}>
            <DownSquare theme="outline" size="14" fill="#333" style={{padding: '0 5px 0 0'}}/>
            下移本句
        </div>
        <div onClick={() => {
            props.data.setShowAddPre(!props.data.showAddPre)
        }} className={styles.sentenceButton}>
            <Add theme="outline" size="14" fill="#333" style={{padding: '0 5px 0 0'}}/>
            在本句前插入句子
            {props.data.showAddPre && <AddSentenceByIndex index={props.data.indexPre}/>}
        </div>
        <div onClick={() => {
            props.data.setShowAddAfter(!props.data.showAddAfter)
        }} className={styles.sentenceButton}>
            <Add theme="outline" size="14" fill="#333" style={{padding: '0 5px 0 0'}}/>
            在本句后插入句子
            {props.data.showAddAfter && <AddSentenceByIndex index={props.data.indexAfter}/>}
        </div>
    </div>
}

export default ControlPanel;
