import styles from './editorMain.module.scss';
import {useEffect, useState} from "react";
import store from "../../store/editorStore";
import runtime from "../../../../env/runtime";
import {CloseSmall, PlayTwo, ViewGridList} from "@icon-park/react";
import SceneEditor from "../sceneEditor";
import recordScroll from "../functions/recordScroll";

const EditorMain = () => {
    const [updateEditor, setUpdateEditor] = useState(false);
    useEffect(() => {
        store.set('updateEditor', updateEditor);
        store.connect('updateEditor', () => {
            setUpdateEditor(store.get('updateEditor'));
            //通知场景编辑器
            store.set('refScene', !store.get('refScene'));
        }, 'updateEditorFunc');
        // store.set('updateEditorWithoutGet', updateEditor);
        // store.connect('updateEditorWithoutGet', () => {
        //     setUpdateEditor(store.get('updateEditorWithoutGet'));
        //     //通知场景编辑器
        //     store.set('updateScene', !store.get('refScene'));
        // }, 'updateEditorWithoutGetFunc');
    }, []);

    const switchTag = (tagName) => {
        //如果当前打开了场景，记录当前滚动的位置
        recordScroll();
        runtime.currentEditScene = tagName;
        store.set('updateEditor', !store.get('updateEditor'));
        store.set('refScene', !store.get('refScene'));
    }

    const closeTag = (tagName) => {
        //如果当前打开了场景，记录当前滚动的位置
        recordScroll();
        //找到tag在列表中的index
        const tagIndex = runtime.currentOpendSceneEdit.indexOf(tagName);
        runtime.currentOpendSceneEdit.splice(tagIndex, 1);
        //判断现在打开的标签页是否为空
        const ifTagListEmpty = runtime.currentOpendSceneEdit.length === 0;
        //判断关闭的是否是当前标签
        const tagCloseCurrent = tagName === runtime.currentEditScene;
        if (!tagCloseCurrent) {
            //什么也不做
        } else if (ifTagListEmpty) {
            runtime.currentEditScene = '';
        } else {
            //删除的是最后一个元素
            if (runtime.currentOpendSceneEdit.length <= tagIndex) {
                runtime.currentEditScene = runtime.currentOpendSceneEdit[runtime.currentOpendSceneEdit.length - 1];
            } else {
                runtime.currentEditScene = runtime.currentOpendSceneEdit[tagIndex];
            }
        }
        store.set('updateEditor', !store.get('updateEditor'));
    }

    //editor的所有数据组织全部从runtime里面调
    const showTags = [];
    for (const e of runtime.currentOpendSceneEdit) {
        let temp;
        if (e === runtime.currentEditScene) {
            temp = <div key={e} className={styles.tagOpened}>
                <PlayTwo theme="outline" size="20" fill="#333" className={styles.tagIcon}/>
                {e}
                <CloseSmall theme="outline" size="20" fill="#333" className={styles.closeIcon} onClick={() => {
                    closeTag(e)
                }}/>
            </div>
        } else {
            temp = <div key={e} className={styles.tag} onClick={() => {
                switchTag(e)
            }}>
                <PlayTwo theme="outline" size="20" fill="#333" className={styles.tagIcon}/>
                {e}
                <CloseSmall theme="outline" size="20" fill="#333" className={styles.closeIcon} onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeTag(e)
                }}/>
            </div>
        }
        showTags.push(temp);
    }

    return <div className={styles.main}>
        <div className={styles.tagList}>
            {showTags}
        </div>
        <div>
            {runtime.currentEditScene !== '' && <SceneEditor key={runtime.currentEditScene} sceneName={runtime.currentEditScene}/>}
        </div>
    </div>
}

export default EditorMain;
