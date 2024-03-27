import EditArea from "./EditArea";
import TagsManager from "./TagsManager";
import styles from './mainArea.module.scss';
import { useEffect } from "react";
import {eventBus} from "@/utils/eventBus";

export default function MainArea() {

  // 建立 WS 连接
  useEffect(()=>{
    try {
      const loc = window.location.hostname;
      const wsUrl =  window.location.protocol === 'http:'? `ws://${loc}/api/webgalsync`: `wss://${loc}/api/webgalsync`;
      console.log('正在启动socket连接位于：' + wsUrl);
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        console.log('socket已连接');
        socket.send('WebGAL Origine 已和 Terre 建立连接');
      };
      socket.onmessage = e => {
        eventBus.emit('get-ws-message',e.data);
      };
      // @ts-ignore
      window['currentWs'] = socket;
    } catch (e) {
      console.warn('ws连接失败');
    }
  },[]);
  return <div className={styles.MainArea_main}>
    <TagsManager/>
    <EditArea/>
  </div>;
}
