import styles from './management.module.scss'
import {useEffect, useState} from "react";
import store from "../editor/store/editorStore";
import runtime, {runtimeTemplate} from "../../env/runtime";
import axios from "axios";
import {Add, AddOne, GameTwo, Plus} from "@icon-park/react";

const Management = () => {
    const [ref, setRef] = useState(true);
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    useEffect(() => {
        store.set('refManagement', ref);
        store.connect('refManagement', () => {
            setRef(store.get('refManagement'))
        }, 'refManagementFunc')
        getGameList();
    }, [])

    const getGameList = () => {
        axios.get(runtime.domain + '/api/manageGame/gameList').then(r => {
            runtime.gameList = r.data;
            store.set('refManagement', !store.get('refManagement'))
        }).catch(e => {
            console.log(e);
        })
    }

    //生成游戏列表，用于使编辑器获得游戏名称
    let showGameList = [];
    for (const e of runtime.gameList) {
        const temp = <div className={styles.singleGameEntryButton} key={e} onClick={() => {
            //resetRuntime
            for (const key in runtime) {
                runtime[key] = runtimeTemplate[key];
            }
            runtime.currentEditGame = e;
            store.set('isManagement', false);
        }
        }>
            <GameTwo theme="outline" size="18" fill="#333" className={styles.buttonIcon}/>
            {e}
        </div>
        showGameList.push(temp);
    }

    const creatGame = (gameName) => {
        const url = `${runtime.domain}/api/manageGame/createGame/${gameName}`
        axios.get(url).then(r => {
            setShowCreatePanel(false);
            getGameList();
        })
    }

    return <div>
        <header>
            <nav>
                <div className={styles.nav}>
                    <div>
                        <span className={styles.title}>WebGAL ORIGINE</span>
                    </div>
                </div>
            </nav>
        </header>
        <main className={styles.main}>
            <div className={styles.subTitle}>
                <span className={styles.addTitle}>游戏列表</span>
                <div>
                    <span onClick={() => setShowCreatePanel(!showCreatePanel)} className={styles.addIcon}>
                    <Plus theme="outline" size="16" fill="#434343" style={{padding: '0 5px 0 0 '}}/>
                    新建游戏
                </span>
                    {showCreatePanel && <div className={styles.createPanel}>
                        <div className={styles.createPanelTitle}>
                            创建游戏
                        </div>
                        <div>
                            游戏名称<input id={'createInput'} className={styles.createPanelInput}/>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div onClick={() => creatGame(document.getElementById('createInput').value)}
                                 className={styles.createButton}>
                                创建
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
            <div className={styles.gameList}>
                {showGameList}
            </div>
        </main>
    </div>
}

export default Management;
