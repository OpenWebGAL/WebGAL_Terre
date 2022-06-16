import {Refresh} from "@icon-park/react";
import {Switch} from "antd";
import styles from'../../sideBar.module.scss'
import runtime from "../../../../../../env/runtime";

export function Preview(){

  function onRPFchange(checked) {
    runtime.isRealtimeRefreashPreview = checked;
  }

  function refreashIframe() {
    const frame1 = document.getElementById('gamePreviewIframe');
    frame1.src = '';
    frame1.src = `${runtime.domain}/Games/${runtime.currentEditGame}`;
  }

  return <>
    <div className={styles.asidePreviewControlBar}>
      <div className={styles.asidePreviewControlBar_single}>
        <span className={styles.gamePrevTitle}>游戏预览</span>
      </div>
      <div id={'refPreviewButton'} className={styles.asidePreviewControlBar_button} onClick={refreashIframe}>
        <Refresh style={{
          transform: 'translate(0,0)', margin: '0 3px 0 0 '
        }} theme="outline" size="14" fill="#000" strokeWidth={3}/>刷新
      </div>
      <div className={styles.asidePreviewControlBar_single}>
        实时更新<span style={{margin: '0 10px 0 0 '}}/>
        <Switch defaultChecked onChange={onRPFchange} size={'small'}/>
      </div>
    </div>
    <iframe id={'gamePreviewIframe'} frameBorder={'0'} className={styles.previewWindow}
            src={`${runtime.domain}/Games/${runtime.currentEditGame}`}/>
  </>
}
