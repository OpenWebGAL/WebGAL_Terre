import {useEffect, useState} from "react";
import store from "./store/editorStore";
import TopBar from "./components/topBar";
import SideBar from "./components/sideBar";
import styles from './editor.module.scss'
import EditorMain from "./components/Editor";
import runtime from "../../env/runtime";

const Editor = () => {
    const [editorStatus, setEditorStatus] = useState(true);
    useEffect(() => {
        store.set('updateEditor', true);
        store.connect('updateEditor', () => {
            setEditorStatus(store.get('updateEditor'))
        }, 'ForceUpdateEditor');
        try {
            const loc = window.location.hostname;
            const wsUrl = `ws://${loc}:9999`;
            console.log('正在启动socket连接位于：' + wsUrl);
            const socket = new WebSocket(wsUrl);
            socket.onopen = () => {
                console.log('socket已连接');
                socket.send('WebGAL Origine 已和 Terre 建立连接');
            };
            socket.onmessage = e => {
                console.log('收到信息', e.data);
            };
            runtime.wsConn = socket;
        } catch (e) {
            console.warn('ws连接失败');
        }
    }, [])
    return <div>
        <TopBar/>
        <main className={styles.main}>
            <SideBar/>
            <EditorMain/>
        </main>
    </div>
}

export default Editor;
