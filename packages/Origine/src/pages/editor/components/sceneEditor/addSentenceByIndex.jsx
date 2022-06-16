import styles from './sceneEditor.module.scss'
import {Avatar, Change, Comment, FileMusic, ListView, Pic, SplitTurnDownRight, Video} from "@icon-park/react";
import {createNewSentence} from "./index";
import {Play} from "@icon-park/react/es";

const AddSentenceByIndex = (props) => {
    return <div style={{lineHeight:'18px'}}>
        <div className={styles.addSentencePanel}>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('dialog', props.index)
            }}><Comment className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                        style={{padding: '0 5px 0 0'}}/>添加对话
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('changeP', props.index)
            }}><Avatar className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                       style={{padding: '0 5px 0 0'}}/>切换立绘
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('bg', props.index)
            }}><Pic className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                    style={{padding: '0 5px 0 0'}}/>切换背景
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('changeScene', props.index)
            }}><Change className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                       style={{padding: '0 5px 0 0'}}/>场景跳转
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('choose', props.index)
            }}><SplitTurnDownRight className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                                   style={{padding: '0 5px 0 0'}}/>分支选择
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('bgm', props.index)
            }}><FileMusic className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                          style={{padding: '0 5px 0 0'}}/>背景音乐
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('video', props.index)
            }}><Video className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                      style={{padding: '0 5px 0 0'}}/>插入视频
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('intro', props.index)
            }}><ListView className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                         style={{padding: '0 5px 0 0'}}/>黑屏文字
            </div>
            <div className={styles.addSentenceButton} onClick={() => {
                createNewSentence('setAnimation', props.index)
            }}><Play className={styles.addItemIcon} theme="outline" size='18' fill="#333"
                         style={{padding: '0 5px 0 0'}}/>设置动画
            </div>
        </div>
    </div>

}

export default AddSentenceByIndex;
