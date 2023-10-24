import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import EditArea from "./EditArea";
import TagsManager from "./TagsManager";
import styles from './mainArea.module.scss';
import { useEffect } from "react";
import { statusActions } from "../../../store/statusReducer";

export default function MainArea() {
  // 主区域需要具有标签页管理的功能。
  // Tags 列表可以拖拽。
  // 这个区域没有自主状态。

  const dispatch = useDispatch();
  // 建立 WS 连接
  useEffect(()=>{
    try {
      const loc = window.location.hostname;
      const wsUrl =  window.location.protocol === 'http:'? `ws://${loc}:9999`: `wss://${loc}/webgalsync`;
      console.log('正在启动socket连接位于：' + wsUrl);
      const socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        console.log('socket已连接');
        socket.send('WebGAL Origine 已和 Terre 建立连接');
      };
      socket.onmessage = e => {
        // console.log('收到信息', e.data);
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
