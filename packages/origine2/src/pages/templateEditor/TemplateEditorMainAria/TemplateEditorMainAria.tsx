import styles from './templateEditorMainAria.module.scss';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import TemplateEditorToolbar from './TemplateEditorToolbar';
import TemplateGraphicalEditor from '../TemplateGraphicalEditor/TemplateGraphicalEditor';
import TemplatePreview from './TemplatePreview';
import TabsManager from './TabsManager';

export default function TemplateMainAria() {

  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const isCodeMode = useTemplateEditorContext((state) => state.isCodeMode);

  return (
    <div className={styles.mainAria}>
      <TemplatePreview />
      <div className={styles.editor}>
        <TabsManager />
        <div className={styles.editorContent}>
          {isCodeMode ? <div>
            {currentTab?.name}<br />
            {currentTab?.path}<br />
            {currentTab?.class}<br />
          </div> : <TemplateGraphicalEditor />}
        </div>
        <TemplateEditorToolbar />
      </div>
    </div>
  );
}