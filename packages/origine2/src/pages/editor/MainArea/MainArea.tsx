import EditArea from "./EditArea";
import TagsManager from "./TagsManager";
import styles from './mainArea.module.scss';
import { useEffect } from "react";
import {eventBus} from "@/utils/eventBus";

export default function MainArea() {

  // 建立 WS 连接
  useEffect(()=>{
    try {
      const loc: string = window.location.hostname;
      const protocol: string = window.location.protocol;
      const port: string = window.location.port; // 获取端口号

      // 默认情况下，不需要在URL中明确指定标准HTTP(80)和HTTPS(443)端口
      let defaultPort = '';
      if (port && port !== '80' && port !== '443') {
        // 如果存在非标准端口号，将其包含在URL中
        defaultPort = `:${port}`;
      }

      if (protocol !== 'http:' && protocol !== 'https:') {
        return;
      }

      // 根据当前协议构建WebSocket URL，并包括端口号（如果有）
      let wsUrl = `ws://${loc}${defaultPort}/api/webgalsync`;
      if (protocol === 'https:') {
        wsUrl = `wss://${loc}${defaultPort}/api/webgalsync`;
      }

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
