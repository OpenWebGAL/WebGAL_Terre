import React, { useEffect, useState } from 'react';
import Assets, { IFileFunction } from '@/components/Assets/Assets';
import ComponentTree from './ComponentTree/ComponentTree';
import styles from './templateEditorSidebar.module.scss';
import useEditorStore from '@/store/useEditorStore';
import { Button } from '@fluentui/react-components';
import { useTemplateEditorContext } from '@/store/useTemplateEditorStore';
import { ArrowLeftFilled, ArrowLeftRegular, bundleIcon } from "@fluentui/react-icons";
import { ITab } from '@/types/templateEditor';
import {t} from "@lingui/macro";
import BackDashboardButton from "@/pages/editor/Topbar/components/BackDashboardButton";
import {redirect} from "@/hooks/useHashRoute";

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);

export default function TemplateEditorSidebar() {
  const templateName = useEditorStore.use.subPage();
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const componentTreeHeight = useTemplateEditorContext((state) => state.componentTreeHeight);

  const tabs = useTemplateEditorContext((state) => state.tabs);
  const updateTabs = useTemplateEditorContext((state) => state.updateTabs);
  const updateCurrentTab = useTemplateEditorContext((state) => state.updateCurrentTab);

  const handleOpen: IFileFunction['open'] = async (file, type) => {
    const newTab: ITab = {
      name: file.name,
      path: file.path,
    };
    if (!tabs.some(tab => tab.path === newTab.path && tab.class === newTab.class)) {
      updateTabs([...tabs, newTab]);
    }
    updateCurrentTab(newTab);
  };

  const backToDashboard = () => redirect('dashboard', 'template');

  return (
    <div className={styles.sidebar} style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}>
      <div className={styles.toolbar}>
        <BackDashboardButton onClick={backToDashboard}/>
        {/* <Button appearance='subtle' icon={<ArrowLeftIcon />} as='a' href='#/dashboard/template' style={{ minWidth: 0 }}>{t`模板列表`}</Button> */}
        <span className={styles.title}>
          {templateName}
        </span>
      </div>
      <div className={styles.componentTree} style={{ height: `${componentTreeHeight}px` }}>
        <ComponentTree />
      </div>
      <ComponentTreeReSizer />
      <div className={styles.assets}>
        <Assets
          basePath={['templates', templateName]}
          // isProtected
          fileFunction={{ open: handleOpen }}
        />
      </div>
    </div>
  );
}

function ComponentTreeReSizer() {
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
    <div
      className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`}
      onMouseDown={handleMouseDown}>
      <div className={styles.dividerLine} />
    </div>
  );
}
