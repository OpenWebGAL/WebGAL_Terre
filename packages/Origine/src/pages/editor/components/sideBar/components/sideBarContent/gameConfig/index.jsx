import styles from './gameConfig.module.scss'
import axios from "axios";
import runtime from "../../../../../../../env/runtime";
import {useEffect, useState} from "react";
import ChooseFile from "../../../../chooseFile";
import {PlayOne} from "@icon-park/react";

const GameConfig = () => {
    const [gameConfig, setGameConfig] = useState(false);
    const [bgmName, setBgmName] = useState('');
    const [bgName, setBgName] = useState('');
    const [loadImgName, setLoadImgName] = useState('');
    //获取到游戏的数据
    const getGameConfig = () => {
        axios.get(`${runtime.domain}/Games/${runtime.currentEditGame}/game/gameConfig.json`).then(r => {
            let newGameConfig = r.data;
            runtime.currentGameConfig = r.data;
            document.getElementById('gameNameInput').value = newGameConfig['Game_name'];
            setBgmName(newGameConfig['Title_bgm']);
            setBgName(newGameConfig['Title_img']);
            setLoadImgName(newGameConfig['Loading_img']);
        })
    }
    const setGameName = () => {
        runtime.currentGameConfig['Game_name'] = document.getElementById('gameNameInput').value;
        updateGameConfig();
    }

    const setGameConfigByProp = (prop, value) => {
        runtime.currentGameConfig[prop] = value;
        updateGameConfig();
    }

    const setConstructor = (propName) => {
        return (value) => {
            setGameConfigByProp(propName, value);
        }
    }

    const updateGameConfig = () => {
        let data = {
            currentEditGame: runtime.currentEditGame,
            config: runtime.currentGameConfig
        }
        axios.post(`${runtime.domain}/api/manageGame/config`, data).then(r => {
        })
    }

    useEffect(() => {
        getGameConfig();
    }, [])

    return <div style={{width: '100%'}}>
        <div>
            <a style={{color: 'black', textDecoration: 'none'}}
               href={`${runtime.domain}/Games/${runtime.currentEditGame}`}
               target="_blank">
                <div className={styles.previewGameButton}>
                    <PlayOne theme="outline" size="24" fill="#FFF"
                             style={{padding: '0 5px 0 0', transform: 'translate(0,5px)'}}/>
                    在新标签页预览游戏
                </div>
            </a>
        </div>
        <div>
            <div className={styles.title}>
                游戏名称
            </div>
            <div className={styles.optionContent}>
                <input onBlur={setGameName} id={"gameNameInput"} className={styles.gameNameInput}/>
            </div>
        </div>
        <div>
            <div className={styles.title}>
                标题背景音乐
            </div>
            <div className={styles.optionContent}>
                {bgmName}
                <ChooseFile setShow={setBgmName} id={'bgmPicker'} dir={'bgm'} set={setConstructor('Title_bgm')}/>
            </div>
        </div>
        <div>
            <div className={styles.title}>
                标题背景
            </div>
            <div className={styles.optionContent}>
                {bgName}
                <ChooseFile setShow={setBgName} id={'bgPicker'} dir={'background'} set={setConstructor('Title_img')}/>
            </div>
        </div>
        {/*<div>*/}
        {/*    <div className={styles.title}>*/}
        {/*        加载图*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*        {loadImgName}*/}
        {/*        <ChooseFile setShow={setLoadImgName} id={'loadImgPicker'} dir={'background'}*/}
        {/*                    set={setConstructor('Loading_img')}/>*/}
        {/*    </div>*/}
        {/*</div>*/}
    </div>
}

export default GameConfig;
