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
import { goTo } from '@/router';
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import { api } from '@/api';
import { GameInfoDto } from '@/api/Api';
import { List, ListItem } from "@fluentui/react-list-preview";
import useSWR, { mutate } from 'swr';

const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const NavigationIcon = bundleIcon(NavigationFilled, NavigationRegular);

export default function TemplateEditorSidebar() {
  const templateDir = useEditorStore.use.subPage();
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const componentTreeHeight = useTemplateEditorContext((state) => state.componentTreeHeight);

  const tabs = useTemplateEditorContext((state) => state.tabs);
  const updateTabs = useTemplateEditorContext((state) => state.updateTabs);
  const updateCurrentTab = useTemplateEditorContext((state) => state.updateCurrentTab);

  const {data: templateConfig} = useSWR(
    `/templateConfig/${templateDir}`,
    async () => (await api.manageTemplateControllerGetTemplateConfig(templateDir)).data
  );

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

  const backToDashboard = () => goTo('dashboard', 'template');

  // 当前模板没有id时自动添加
  useEffect(() => {
    if (templateConfig && !templateConfig.id) {
      const newTemplateConfig = {
        ...templateConfig,
        id: crypto.randomUUID(),
      };
      api.manageTemplateControllerUpdateTemplateConfig({templateDir, newTemplateConfig});
      mutate(`/templateConfig/${templateDir}`);
    }
  },[templateConfig]);

  return (
    <div className={styles.sidebar} style={{width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`}}>
      <div className={styles.toolbar}>
        <BackDashboardButton onClick={backToDashboard}/>
        {/* <Button appearance='subtle' icon={<ArrowLeftIcon />} as='a' href='#/dashboard/template' style={{ minWidth: 0 }}>{t`模板列表`}</Button> */}
        <span className={styles.title}>
          {templateConfig ? templateConfig.name : templateDir}
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
          rootPath={['templates', templateDir]}
          // isProtected
          fileFunction={{open: handleOpen}}
        />
      </div>
    </div>
  );
}

const OptionMenu = () => {
  const templateDir = useEditorStore.use.subPage();

  const [applyTemplateDialogIsOpen, setApplyTemplateDialogIsOpen] = useState(false);

  const [gameList, setGameList] = useState<GameInfoDto[]>([]);
  const [selectedGameDirs, setSelectedGameDirs] = useState<string[]>([]);

  const getGameList = async () => {
    const gameList = (await api.manageGameControllerGetGameList()).data;
    const selectedGameDirs = gameList.filter((game) => game.template.name === templateDir).map((game) => game.dir);
    setGameList(gameList);
    setSelectedGameDirs(selectedGameDirs);
  };

  const applyTemplate = async () => {
    const apply = selectedGameDirs.map(async (gameDir) => await api.manageTemplateControllerApplyTemplateToGame({gameDir, templateDir}));
    await Promise.all(apply);
    setApplyTemplateDialogIsOpen(false);
  };

  return (
    <>
      <Menu>
        <MenuTrigger>
          <MenuButton appearance='subtle' icon={<NavigationIcon />} title={t`选项菜单`} style={{ minWidth: 0, textWrap: 'nowrap' }} />
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem
              onClick={
                () => {
                  setApplyTemplateDialogIsOpen(true);
                  getGameList();
                }
              }
            >{t`将当前模板应用到选定的游戏`}</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Dialog open={applyTemplateDialogIsOpen} onOpenChange={(event, data) => setApplyTemplateDialogIsOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t`将当前模板应用到选定的游戏`}</DialogTitle>
            <DialogContent style={{padding: '0.5rem 0'}}>
              <List
                selectionMode="multiselect"
                selectedItems={selectedGameDirs}
                onSelectionChange={(_, data) => setSelectedGameDirs(data.selectedItems as string[])}
              >
                {
                  gameList.map((game) => (
                    <ListItem
                      key={game.dir}
                      value={game.dir}
                      aria-label={game.dir}
                      checkmark={{"value": game.dir}}
                      style={{userSelect: 'none'}}
                    >
                      <div style={{padding: '0.25rem 0.5rem'}}>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem'}}>
                          <div style={{width: '4rem', aspectRatio: '16 / 9', overflow: 'hidden'}}>
                            <img
                              src={`/games/${game.dir}/game/background/${game.cover}`}
                              alt={game.name}
                              style={{width: '100%', height: '100%', objectFit: 'cover'}}
                            />
                          </div>
                          <div>
                            <div>{game.name}</div>
                            <div style={{fontSize: '90%', color: 'var(--text-sub)'}}>
                              {t`使用中的模板：` + game.template.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ListItem>
                  ))
                }
              </List>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t`取消`}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={() => applyTemplate()}>{t`应用`}</Button>
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
