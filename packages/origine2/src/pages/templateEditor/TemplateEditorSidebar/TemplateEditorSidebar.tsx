import React, { useEffect, useState } from 'react';
import Assets from '@/components/Assets/Assets';
import ComponentTree from './ComponentTree/ComponentTree';
import styles from './templateEditorSidebar.module.scss';
import useEditorStore from '@/store/useEditorStore';
import { Button } from '@fluentui/react-components';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import { ArrowLeftFilled, ArrowLeftRegular, bundleIcon } from "@fluentui/react-icons";

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);

export default function TemplateEditorSidebar() {
  const templateName = useEditorStore.use.subPage();
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const componentTreeHeight = useTemplateEditorContext((state) => state.componentTreeHeight);
  const updateComponentTreeHeight = useTemplateEditorContext((state) => state.updateComponentTreeHeight);

  const minHeight = 0;
  const [isDragging, setIsDragging] = useState(false);
  const [initY, setInitY] = useState(0);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setInitY(event.clientY);
  };

  useEffect(
    () => {
      const moveHandler = (event: any) => {
        if (!isDragging) return;
        const deltaY = event.clientY - initY;
        const newHeight = Math.max(minHeight, componentTreeHeight + deltaY);
        updateComponentTreeHeight(newHeight);
      };

      const upHandler = () => {
        setIsDragging(false);
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);

      return () => {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      };
    },
    [isDragging, initY]
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.container} style={{ width: `${sidebarWidth}px` }}>
        <div className={styles.toolbar}>
          <Button appearance='subtle' icon={<ArrowLeftIcon />} as='a' href='#/dashboard/template' style={{ minWidth: 0 }}>模板列表</Button>
          <span className={styles.title}>
            {templateName}
          </span>
        </div>
        <div className={styles.componentTree} style={{ height: `${componentTreeHeight}px` }}>
          <ComponentTree />
        </div>
        <div className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`} onMouseDown={handleMouseDown}><div className={styles.dividerLine}>‖</div></div>
        <div className={styles.assets}>
          <Assets basePath={['public', 'templates', templateName,]} isProtected />
        </div>
      </div>
    </div>
  );
}
