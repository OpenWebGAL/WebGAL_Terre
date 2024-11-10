import React, {ReactNode, useEffect, useState} from 'react';
import Assets, {IFileFunction} from '@/components/Assets/Assets';
import ComponentTree from './ComponentTree/ComponentTree';
import styles from './templateEditorSidebar.module.scss';
import useEditorStore from '@/store/useEditorStore';
import {Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger} from '@fluentui/react-components';
import {useTemplateEditorContext} from '@/store/useTemplateEditorStore';
import {ArrowLeftFilled, ArrowLeftRegular, bundleIcon, NavigationFilled, NavigationRegular} from "@fluentui/react-icons";
import {ITab} from '@/types/templateEditor';
import {t} from "@lingui/macro";
import BackDashboardButton from "@/pages/editor/Topbar/components/BackDashboardButton";
import {redirect} from "@/hooks/useHashRoute";
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);

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
    <div className={styles.sidebar} style={{width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`}}>
      <div className={styles.toolbar}>
        <BackDashboardButton onClick={backToDashboard}/>
        {/* <Button appearance='subtle' icon={<ArrowLeftIcon />} as='a' href='#/dashboard/template' style={{ minWidth: 0 }}>{t`模板列表`}</Button> */}
        <span className={styles.title}>
          {templateName}
        </span>
        <OptionMenu/>
      </div>
      <div className={styles.componentTree} style={{height: `${componentTreeHeight}px`}}>
        <ComponentTree/>
      </div>
      <ComponentTreeReSizer/>
      <div className={styles.assets}>
        <CommonTips style={{margin:4}} text={t`提示：样式中用到的资源放在 assets 目录下`}/>
        <Assets
          basePath={['templates', templateName]}
          // isProtected
          fileFunction={{open: handleOpen}}
        />
      </div>
    </div>
  );
}

const OptionMenu = (): ReactNode => {
  const templateName = useEditorStore.use.subPage();

  const [applyTemplateDialogIsOpen, setApplyTemplateDialogIsOpen] = useState(false);

  const [gameList, setGameList] = useState([]);
  const [selectedGame, setSelectedGame] = useState<string[]>([]);

  return (
    <>
      <Menu>
        <MenuTrigger>
          <MenuButton appearance='subtle' icon={<NavigationIcon />} title={t`选项菜单`} style={{ minWidth: 0, textWrap: 'nowrap' }} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={() => setApplyTemplateDialogIsOpen(true)}>{t`应用当前模板到游戏`}</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Dialog open={applyTemplateDialogIsOpen} onOpenChange={(event, data) => setApplyTemplateDialogIsOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t`应用当前模板到游戏`}</DialogTitle>
            <DialogContent>
              {gameList}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t`取消`}</Button>
              </DialogTrigger>
              <Button appearance="primary">{t`应用`}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

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
      <div className={styles.dividerLine}/>
    </div>
  );
}
