import styles from './editArea.module.scss';
import { useSelector } from "react-redux";
import { RootState } from "../../../store/origineStore";
import TextEditor from "../TextEditor/TextEditor";

export default function EditArea(){
  const selectedTagTarget = useSelector((state:RootState)=>state.status.editor.selectedTagTarget);
  // 根据 tag 的类型选择怎样显示编辑器主体区域，现在先默认设置为 scene
  const showType = 'scene';
  return <div className={styles.editArea_main}>
    {selectedTagTarget === '' && <div className={styles.none_text}>目前没有打开任何文件</div>}
    {selectedTagTarget!==''&&<TextEditor targetPath={selectedTagTarget}/>}
  </div>;
}
