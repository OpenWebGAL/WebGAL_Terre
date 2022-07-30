import styles from './editArea.module.scss';
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import TextEditor from "../TextEditor/TextEditor";

export default function EditArea(){
  const state = useSelector((state:RootState)=>state.status.editor);
  // 根据 tag 的类型选择怎样显示编辑器主体区域，现在先默认设置为 scene
  const showType = 'scene';
  return <div className={styles.editArea_main}>
    {state.selectedTagTarget === '' && <div>目前没有打开任何文件</div>}
    {state.selectedTagTarget!==''&&<TextEditor targetPath={state.selectedTagTarget}/>}
  </div>;
}
