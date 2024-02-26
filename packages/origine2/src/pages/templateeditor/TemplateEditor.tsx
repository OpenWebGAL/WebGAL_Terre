import styles from "./templateeditor.module.scss"
import { RootState } from "@/store/origineStore"
import { useSelector } from "react-redux"

export default function TemplateEditor(){
  const isShowTemplateEditor = useSelector((state:RootState) => state.status.templateeditor.showtemplateeditor)

  return <>
  {!isShowTemplateEditor && <div className={styles.editor}>
    
    </div>}
  </>
}