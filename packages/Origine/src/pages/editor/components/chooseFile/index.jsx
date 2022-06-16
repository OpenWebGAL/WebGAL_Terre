import {useEffect, useState} from "react";
import axios from "axios";
import runtime from "../../../../env/runtime";
import styles from './chooseFile.module.scss';
import {Edit, FolderClose, Notes} from "@icon-park/react";


const ChooseFile = (props) => {
    const [showChooseWindow, setShowChooseWindow] = useState(false);
    const [currentDir, setCurrentDir] = useState(props.dir);
    const [currentDirContent, setCurrentDirContent] = useState([]);
    const [choosedFile, setChoosedFile] = useState('');
    const getFileByDir = (current) => {
        const gameName = runtime.currentEditGame;
        const data = {'dir': `/${gameName}/game/${current}`};
        axios.post(`${runtime.domain}/api/editGame/getAssets/`, data).then(r => {
            setCurrentDirContent(r.data);
        }).catch(e => {
            console.log(e)
        })
    }

    const simpFileDir = (setDir) => {
        let setDirList = setDir.split('/');
        setDir = '';
        let count = 0;
        for (const e of setDirList) {
            if (e !== props.dir) {
                if (count !== 0) {
                    setDir = setDir + '/';
                }
                count++;
                setDir = setDir + e;
            }
        }
        return setDir;
    }

    const setBysetFunc = (name) => {
        //首先，找出最终设置的目录
        let setDir = currentDir + '/' + name;
        //移除入口目录，因为脚本是这么设计的。
        setDir = simpFileDir(setDir);
        props.set(setDir);
        if (props.hasOwnProperty('setShow')) {
            props.setShow(setDir);
        }
    }

    useEffect(() => {
        getFileByDir(currentDir);
    }, [])

    let showFileList = [];
    for (const e of currentDirContent) {
        //判断是不是目录，如果是，则点击目录的效果是进入二级
        let isDir = true;
        let show = true;
        if (e.match(/\.json/)) {
            show = false;
        }
        if (e.match(/\./))
            isDir = false;
        let temp = <div>{''}</div>
        if (isDir) {
            temp = <div className={styles.singleFile} key={e} onClick={() => {
                const dir = currentDir + '/' + e;
                setCurrentDir(dir);
                getFileByDir(dir);
            }}><FolderClose theme="outline" size="18" fill="#333" className={styles.fileIcon}/>{e}</div>
        } else {
            temp = <div className={styles.singleFile} key={e} onClick={() => {
                setChoosedFile(simpFileDir(currentDir + '/' + e));
                setBysetFunc(e);
                setShowChooseWindow(!showChooseWindow);
            }}><Notes theme="outline" size="18" fill="#333" className={styles.fileIcon}/>{e}</div>;
        }
        if (show)
            showFileList.push(temp);
    }

    return <div>
        <div className={styles.chooseBox}>
            <div className={styles.chooseIcon} onClick={() => {
                // 恢复初始状态
                if (showChooseWindow === false) {
                    setCurrentDir(props.dir);
                    setChoosedFile('');
                    getFileByDir(props.dir);
                }
                setShowChooseWindow(!showChooseWindow)
            }}>
                <Edit theme="outline" size="16" fill="#333"/>
                <span className={styles.chooseTitle}>选择文件</span>
            </div>
            {/*<div className={styles.choosed}>*/}
            {/*    {choosedFile !== '' ? choosedFile : '未更改'}*/}
            {/*</div>*/}
        </div>
        <div style={{position: 'relative'}}>
            {showChooseWindow && <div className={styles.fileList}>{showFileList}</div>}
        </div>
    </div>

}

export default ChooseFile;
