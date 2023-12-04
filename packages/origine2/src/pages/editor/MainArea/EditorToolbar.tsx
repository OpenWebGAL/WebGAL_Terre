import {DataSheet, FileCodeOne, ListView} from '@icon-park/react';
import s from './editorToolbar.module.scss';

export default function EditorToolbar() {
  return <div className={s.toolbar}>
    <div className={s.tollbar_button}>
      <DataSheet theme="outline" size="20" fill="#333" strokeWidth={3}/>
      364 行脚本，1,126 个字
    </div>
    <div className={s.tollbar_button} style={{marginLeft: 'auto'}}>
      <FileCodeOne theme="outline" size="20" fill="#333" strokeWidth={3}/>
      脚本编辑器
    </div>
    <div className={s.tollbar_button}>
      <ListView theme="outline" size="20" fill="#333" strokeWidth={3}/>
      图形编辑器
    </div>
  </div>;
}
