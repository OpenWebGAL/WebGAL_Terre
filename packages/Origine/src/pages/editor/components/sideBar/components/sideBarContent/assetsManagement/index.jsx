import {useEffect, useState} from "react";
import store from "../../../../../store/editorStore";
import runtime from "../../../../../../../env/runtime";
import styles from './assetsManagement.module.scss'
import axios from "axios";
import {
    ArrowUp,
    Delete,
    FileEditing,
    FolderClose,
    FolderPlus,
    LeftSmall,
    Return,
    Upload,
    UpSmall
} from "@icon-park/react";
import {IconMap, dirMap} from "./DirMap";

const AssetsManagement = () => {
    const [refAssetsManagement, setRefAssetsManagement] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [showAddDir, setShowAddDir] = useState(false);
    useEffect(() => {
        store.set('refAssetsManagement', refAssetsManagement);
        store.connect('refAssetsManagement', () => {
            setRefAssetsManagement(store.get('refAssetsManagement'))
        }, 'refAssetsManagement');
        getCurrentDir();
    }, []);
    const getCurrentDir = () => {
        const gameName = runtime.currentEditGame;
        //当前目录。如果当前目录为空，就代表现在是根目录，因此不显示单独的文件，只显示目录
        const currentDir = runtime.currentDir;
        const data = {'dir': `/${gameName}/game/${currentDir}`};
        axios.post(`${runtime.domain}/api/editGame/getAssets/`, data).then(r => {
            runtime.currentDirContent = r.data;
            store.set('refAssetsManagement', !store.get('refAssetsManagement'));
        }).catch(e => {
            console.log(e)
        })
    }
    const back = () => {
        if (runtime.currentDir === '')
            return;
        let dirStrToList = runtime.currentDir.split('/');
        dirStrToList.pop();
        runtime.currentDir = dirStrToList.reduce((pre, cur) => '' + pre + '/' + cur);
        getCurrentDir();
    }

    const cd = (dir) => {
        runtime.currentDir = runtime.currentDir + `/${dir}`;
        getCurrentDir();
    }

    const uploadFile = () => {
        //获得要上传文件的目录
        const gameName = runtime.currentEditGame;
        //当前目录。如果当前目录为空，就代表现在是根目录，因此不显示单独的文件，只显示目录
        const currentDir = runtime.currentDir;
        const dir = `/${gameName}/game/${currentDir}`;
        let form = new FormData();
        form.append('dir', dir);
        const file = document.getElementById('uploadFile').files[0];
        let fileName = document.getElementById('uploadFile').value;
        form.append('file', file, fileName);
        axios.post(`${runtime.domain}/api/editGame/addAsset/`, form, {headers: {'Content-Type': 'multipart/form-data'}}).then(r => {
            setShowUpload(false);
            getCurrentDir();
        }).catch(e => {
            console.log(e);
        })
    }

    const addDir = () => {
        const gameName = runtime.currentEditGame;
        const currentDir = runtime.currentDir;
        const dir = `/${gameName}/game/${currentDir}`;
        const dirName = document.getElementById('addDirInput').value;
        const data = {current: dir, Name: dirName}
        axios.post(`${runtime.domain}/api/editGame/mkdir/`, data).then(r => {
            setShowAddDir(false);
            getCurrentDir();
        }).catch(e => {
            console.log(e);
        })
    }

    const switchUpload = () => {
        setShowUpload(!showUpload);
    }

    const switchAddDir = () => {
        setShowAddDir(!showAddDir);
    }

    //开始显示当前目录里的内容
    const showDirContent = [];
    for (const currentDirContentElement of runtime.currentDirContent) {
        let temp = '';
        let pushIntoSirContent = true;
        //首先判断是不是目录
        if (!currentDirContentElement.match(/\./)) {

            //是目录，按照目录的方式处理
            //判断是不是特殊目录
            let dirName = currentDirContentElement;
            if (runtime.currentDir === '' && dirMap.hasOwnProperty(currentDirContentElement)) {
                dirName = dirMap[currentDirContentElement];
            }
            temp = <div className={styles.dirButton} key={currentDirContentElement}
                        onClick={() => cd(currentDirContentElement)}>
                <span className={styles.icon_small}><IconMap icon={currentDirContentElement}/></span>
                {dirName}
            </div>
            if (currentDirContentElement === 'scene' && runtime.currentDir === '')
                pushIntoSirContent = false;//场景文件不算做资源，有专门的处理方案
        } else {
            //是文件，按照文件的方式处理
            if (runtime.currentDir === '')
                pushIntoSirContent = false;//如果是根目录，那么就不显示文件
            //不是根目录，现在正常处理文件
            temp = <div className={styles.fileElement} key={currentDirContentElement}>
                <span className={styles.icon_small}><IconMap icon={'file'}/></span>
                {currentDirContentElement}
                {/*<div>*/}
                {/*    <FileEditing theme="outline" size="24" fill="#333"/>*/}
                {/*    <Delete theme="outline" size="24" fill="#333"/>*/}
                {/*</div>*/}
            </div>
        }

        // 处理元素完毕，将其加入文件资源管理器显示的内容
        if (pushIntoSirContent)
            showDirContent.push(temp);
    }

    return <div className={styles.main}>
        {/*<div className={styles.title}>*/}
        {/*    素材管理*/}
        {/*</div>*/}
        {runtime.currentDir !== '' &&
            <div className={styles.currentDirShow}>
                {runtime.currentDir}
            </div>}
        {
            runtime.currentDir !== '' && <div className={styles.controlPanel}>
                <div>
                    <Return theme="outline" size="24" fill="#333" onClick={back} className={styles.panelButton}/>
                </div>
                <div>
                    <Upload theme="outline" size="24" fill="#333" onClick={switchUpload} className={styles.panelButton}/>
                    {
                        showUpload && <div className={styles.upload}>
                            <div className={styles.uploadTitle}>上传文件</div>
                            <input id={'uploadFile'} type={'file'}/>
                            <div className={styles.uploadButton} onClick={uploadFile}>上传</div>
                        </div>
                    }
                </div>
                <div>
                    <FolderPlus theme="outline" size="24" fill="#333" onClick={switchAddDir}
                                className={styles.panelButton}/>
                    {
                        showAddDir && <div className={styles.upload}>
                            <div className={styles.uploadTitle}>新建文件夹</div>
                            <input id={'addDirInput'}/>
                            <div className={styles.uploadButton} onClick={addDir}>新建</div>
                        </div>
                    }
                </div>
            </div>
        }
        <div>
        </div>
        <div className={styles.dirButtonContainer}>
            {showDirContent}
        </div>
    </div>
}

export default AssetsManagement;
