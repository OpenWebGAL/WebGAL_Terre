import TemplateEditorSidebar from "./TemplateEditorSidebar/TemplateEditorSidebar";
import TemplateEditorMainAria from "./TemplateEditorMainAria/TemplateEditorMainAria";
import styles from "./templateEditor.module.scss";

export default function TemplateEditor(){
  return (
    <div className={styles.editor}>
      <div className={styles.container}>
        <TemplateEditorSidebar />
        <div className={styles.divider}><div className={styles.dividerLine}>‖</div></div>
        <TemplateEditorMainAria />
      </div>
    </div>
  );
}