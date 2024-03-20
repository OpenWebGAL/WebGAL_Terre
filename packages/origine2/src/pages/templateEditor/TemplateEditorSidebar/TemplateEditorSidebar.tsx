import Assets from '@/components/Assets/Assets';
import UITree from './UITree/UITree';
import styles from './templateEditorSidebar.module.scss';
import useEditorStore from '@/store/useEditorStore';
import { Button } from '@fluentui/react-components';

export default function TemplateEditorSidebar() {
  const templateName = useEditorStore.use.subPage();
  const sidebarWidth = 280;
  const uiTreeheight = 400;
  return (
    <div className={styles.sidebar}>
      <div className={styles.container} style={{width: `${sidebarWidth}px`}}>
        <div className={styles.toolbar}>
          <Button appearance='secondary' as='a' href='#/dashboard/template' style={{minWidth: 0}}>模板列表</Button>
          <span className={styles.title}>
            {templateName}
          </span>
        </div>
        <div className={styles.uiTree} style={{height: `${uiTreeheight}px`}}>
          <UITree />
        </div>
        <div className={styles.divider}><div className={styles.dividerLine}>‖</div></div>
        <div className={styles.assets}>
          <Assets basePath={['public', 'templates', templateName, 'template']} isProtected/>
        </div>
      </div>
    </div>
  );
}