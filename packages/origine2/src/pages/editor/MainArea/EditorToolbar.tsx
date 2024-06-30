import {DataSheet, FileCodeOne, ListView, Terminal} from '@icon-park/react';
import s from './editorToolbar.module.scss';
import {useEffect, useState} from "react";
import {eventBus} from "@/utils/eventBus";
import {useGameEditorContext} from '@/store/useGameEditorStore';
import { t } from '@lingui/macro';

export default function EditorToolbar() {
  const isCodeMode = useGameEditorContext((state) => state.isCodeMode);
  const isShowDebugger = useGameEditorContext((state)=> state.isShowDebugger);
  const updateIsCodeMode = useGameEditorContext((state)=> state.updateIsCodeMode);
  const updateIsShowDebugger = useGameEditorContext((state) => state.updateIsShowDebugger);

  const [textNum,setTextNum] = useState(0);
  const [lineNum,setLineNum] = useState(0);

  // 函数用于格式化数字，添加千分位分隔符
  function formatNumberWithCommas(num:number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // 创建两个字符串
  const textNumString = formatNumberWithCommas(textNum);
  const lineNumString = formatNumberWithCommas(lineNum);

  const handleSetCodeMode = () => updateIsCodeMode(true);
  const handleSetGraphMode = () => updateIsCodeMode(false);

  useEffect(() => {
    const handleUpdagteScene = (scene:string)=>{
      const wordsAndChars = scene.match(/[\w]+|[^\s\w]/g) || [];
      setTextNum(wordsAndChars.length);
      setLineNum(scene.split('\n').length);
    };

    // @ts-ignore
    eventBus.on('update-scene',handleUpdagteScene);
    return ()=>{
      // @ts-ignore
      eventBus.off('update-scene',handleUpdagteScene);
    };
  }, []);


  const switchDebugger = ()=>{
    updateIsShowDebugger(!isShowDebugger);
  };

  return <div className={s.toolbar}>
    <div className={s.toolbar_button+ ' ' + (isShowDebugger  ? s.toolbar_button_active : '')} onClick={()=>switchDebugger()}>
      <Terminal theme="outline" size="20" fill={isShowDebugger ? '#005CAF' : "#333"} strokeWidth={3}/>
      DEBUGGER
    </div>
    <div className={s.toolbar_button}>
      <DataSheet theme="outline" size="20" fill="#333" strokeWidth={3}/>
      {lineNumString} {t`行脚本`}, {textNumString} {t`个字`}
    </div>
    <div onClick={handleSetCodeMode} className={s.toolbar_button + ' ' + (isCodeMode ? s.toolbar_button_active : '')}
      style={{marginLeft: 'auto'}}>
      <FileCodeOne theme="outline" size="20" fill={isCodeMode ? '#005CAF' : "#333"} strokeWidth={3}/>
      {t`脚本编辑器`}
    </div>
    <div onClick={handleSetGraphMode} className={s.toolbar_button + ' ' + (!isCodeMode ? s.toolbar_button_active : '')}>
      <ListView theme="outline" size="20" fill={isCodeMode ? "#333" : '#005CAF'} strokeWidth={3}/>
      {t`图形编辑器`}
    </div>
  </div>;
}
