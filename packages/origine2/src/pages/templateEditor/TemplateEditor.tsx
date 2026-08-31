import TemplateEditorSidebar from './TemplateEditorSidebar/TemplateEditorSidebar';
import TemplateEditorMainAria from './TemplateEditorMainAria/TemplateEditorMainAria';
import SplitPane from '@/components/SplitPane/SplitPane';
import styles from './templateEditor.module.scss';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import {
  useComponentTreeChoose,
  useComponentTreeTextbox,
  useComponentTreeTitle,
  useTemplateTempScene,
} from '@/pages/templateEditor/TemplateEditorSidebar/ComponentTree/ComponentTree';

export default function TemplateEditor() {
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const updateSidebarWidth = useTemplateEditorContext((state) => state.updateSidebarWidth);

  return (
    <div className={styles.editor}>
      <SplitPane
        direction="horizontal"
        value={sidebarWidth}
        onChange={updateSidebarWidth}
        minSize={200}
        fixedPanel="first"
        disablePointerOn="#templatePreviewIframe, #templateEditorAria"
      >
        <TemplateEditorSidebar />
        <TemplateEditorMainAria />
      </SplitPane>
    </div>
  );
}

export const sendComponentPreviewMessage = (componentPath: string, componentClass: string) => {
  if (componentPath.includes(useComponentTreeTitle().path)) {
    EditorPreviewClient.setComponentVisibility({
      showTitle: true,
      showPanicOverlay: false,
    });
  } else if (componentPath.includes(useComponentTreeTextbox().path)) {
    const miniAvatar = componentClass.toLowerCase().includes('miniavataroff') ? '' : 'miniavatar.webp';
    EditorPreviewClient.runSceneContent(
      `changeBg:bg.webp -next;\nminiAvatar:${miniAvatar} -next;\n${useTemplateTempScene().textbox}`,
    );
  } else if (componentPath.includes(useComponentTreeChoose().path)) {
    EditorPreviewClient.runSceneContent(`changeBg:bg.webp -next;\n${useTemplateTempScene().choose}`);
  }
};
