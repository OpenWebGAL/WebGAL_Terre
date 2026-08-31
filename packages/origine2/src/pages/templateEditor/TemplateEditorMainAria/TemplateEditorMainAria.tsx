import styles from './templateEditorMainAria.module.scss';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import TemplateEditorToolbar from './TemplateEditorToolbar';
import TemplateGraphicalEditor from '../TemplateGraphicalEditor/TemplateGraphicalEditor';
import TemplatePreview from './TemplatePreview';
import TabsManager from './TabsManager';
import TextEditor from '@/pages/templateEditor/TextEditor/TextEditor';
import useEditorStore from '@/store/useEditorStore';
import SplitPane from '@/components/SplitPane/SplitPane';

export default function TemplateMainAria() {
  const templateDir = useEditorStore.use.subPage();
  const currentTab = useTemplateEditorContext((state) => state.currentTab);
  const isClass = currentTab?.class && currentTab?.class?.length > 0;
  const isCodeMode = useTemplateEditorContext((state) => state.isCodeMode) || !isClass;

  const basePath = ['templates', templateDir];

  const targetPath = [
    ...basePath,
    currentTab?.path?.startsWith(basePath.join('/'))
      ? currentTab?.path?.slice(basePath.join('/').length + 1) // 兼容旧版本路径
      : currentTab?.path,
  ].join('/');

  return (
    <div className={styles.mainAria}>
      <SplitPane
        direction="vertical"
        defaultSize={280}
        minSize={36}
        persistKey="template-preview-height"
        fixedPanel="first"
        disablePointerOn="#templatePreviewIframe"
      >
        <TemplatePreview />
        <div className={styles.editor} id="templateEditorAria">
          <TabsManager />
          <div className={styles.editorContent}>
            {currentTab?.path &&
              (isCodeMode ? (
                <TextEditor path={targetPath} key={currentTab?.path + currentTab?.class} />
              ) : (
                <TemplateGraphicalEditor path={targetPath} className={currentTab?.class ?? ''} />
              ))}
          </div>
          <TemplateEditorToolbar />
        </div>
      </SplitPane>
    </div>
  );
}
