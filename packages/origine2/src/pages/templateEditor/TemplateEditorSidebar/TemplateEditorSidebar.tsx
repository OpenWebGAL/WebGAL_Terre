import React, {useEffect, useRef, useState} from 'react';
import Assets, {IFileFunction} from '@/components/Assets/Assets';
import styles from './templateEditorSidebar.module.scss';
import useEditorStore from '@/store/useEditorStore';
import {Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger} from '@fluentui/react-components';
import {useTemplateEditorContext} from '@/store/useTemplateEditorStore';
import {t} from "@lingui/macro";
import BackDashboardButton from "@/pages/editor/Topbar/components/BackDashboardButton";
import { goTo } from '@/router';
import CommonTips from "@/pages/editor/GraphicalEditor/components/CommonTips";
import { api } from '@/api';
import { GameInfoDto, TemplateConfigDto } from '@/api/Api';
import { List, ListItem } from "@fluentui/react-list-preview";
import useSWR, { mutate } from 'swr';
import TemplateConfigDialog from './TemplateConfigDialog';
import {PlugConnected20Regular, Settings20Regular, Textbox20Regular, TextboxCheckmark20Regular} from "@fluentui/react-icons";
import { createId } from '@/utils/createId';
import { AppSettingsButton } from '@/components/AppSettings/AppSettingsDialog';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import type { UiPartDescriptor, UiScreenId } from '@webgal/editor-preview-protocol';
import { ScreenPartTree } from '../sidebar/ScreenPartTree';
import { UI_SCREEN_IDS, type TemplateScreensInfo } from '../screenCatalog';

export interface ITemplateSidebarCustomSession {
  screensInfo: TemplateScreensInfo | null;
  activeScreenId: UiScreenId | null;
  parts: UiPartDescriptor[];
  selectedPartId: string | null;
  onSelectScreen: (screen: UiScreenId) => void;
  onSelectPart: (partId: string) => void;
  onSwitchVariant: (screen: UiScreenId, variantId: string) => Promise<void>;
  onImportVariant: (screen: UiScreenId, file: File) => Promise<void>;
}

interface ITemplateEditorSidebarProps {
  customSession?: ITemplateSidebarCustomSession;
}

export default function TemplateEditorSidebar({ customSession }: ITemplateEditorSidebarProps) {
  const templateDir = useEditorStore.use.subPage();
  const sidebarWidth = useTemplateEditorContext((state) => state.sidebarWidth);
  const templateActionsHeight = useTemplateEditorContext((state) => state.templateActionsHeight);
  const componentTreeHeight = useTemplateEditorContext((state) => state.componentTreeHeight);

  const updateStyleTab = useTemplateEditorContext((state) => state.updateStyleTab);
  const updateFullCssMode = useTemplateEditorContext((state) => state.updateFullCssMode);

  const {data: templateConfig, mutate: mutateTemplateConfig} = useSWR(
    `/templateConfig/${templateDir}`,
    async () => (await api.manageTemplateControllerGetTemplateConfig(templateDir)).data
  );

  const handleOpen: IFileFunction['open'] = async (file) => {
    if (!customSession) {
      return;
    }
    const normalized = file.path.replace(/\\/g, '/');
    const matched = normalized.match(/screens\/([^/]+)\/[^/]+\/style\.scss$/);
    if (matched && UI_SCREEN_IDS.includes(matched[1] as UiScreenId)) {
      const targetScreen = matched[1] as UiScreenId;
      if (customSession.activeScreenId !== targetScreen) {
        customSession.onSelectScreen(targetScreen);
      }
    }
    updateStyleTab('full');
    updateFullCssMode('code');
  };

  const backToDashboard = () => goTo('dashboard', 'template');

  // 当前模板没有id时自动添加（仅对可编辑的 4.7 模板生效）
  useEffect(() => {
    if (customSession && templateConfig && !templateConfig.id) {
      const newTemplateConfig = {
        ...templateConfig,
        id: createId(),
      };
      api.manageTemplateControllerUpdateTemplateConfig({templateDir, newTemplateConfig});
      mutate(`/templateConfig/${templateDir}`);
    }
  },[customSession, templateConfig, templateDir]);

  return (
    <div className={styles.sidebar} style={{width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px`}}>
      <div className={styles.toolbar}>
        <BackDashboardButton onClick={backToDashboard}/>
        <span className={styles.title}>
          {templateConfig ? templateConfig.name : templateDir}
        </span>
      </div>
      {customSession ? (
        <>
          <div className={styles.actionsBlock} style={{height: `${templateActionsHeight}px`}}>
            <TemplateActions
              templateConfig={templateConfig}
              onTemplateConfigUpdated={async () => {
                await mutateTemplateConfig();
              }}
            />
          </div>
          <TemplateActionsReSizer/>
          <div className={styles.componentTree} style={{height: `${componentTreeHeight}px`}}>
            <ScreenPartTree
              screensInfo={customSession.screensInfo}
              activeScreenId={customSession.activeScreenId}
              parts={customSession.parts}
              selectedPartId={customSession.selectedPartId}
              onSelectScreen={customSession.onSelectScreen}
              onSelectPart={customSession.onSelectPart}
              onSwitchVariant={customSession.onSwitchVariant}
              onImportVariant={customSession.onImportVariant}
            />
          </div>
          <ComponentTreeReSizer/>
        </>
      ) : (
        <div className={styles.actions}>
          <AppSettingsButton appearance="transparent" className={styles.actionButton} />
        </div>
      )}
      <div className={styles.assets}>
        <CommonTips
          style={{margin:4}}
          text={customSession ? t`提示：样式中用到的资源放在 assets 目录下` : t`旧版模板当前为只读状态，升级后即可编辑`}
        />
        <Assets
          rootPath={['templates', templateDir]}
          isProtected={!customSession}
          fileFunction={customSession ? {open: handleOpen} : undefined}
        />
      </div>
    </div>
  );
}

interface TemplateActionsProps {
  templateConfig?: TemplateConfigDto;
  onTemplateConfigUpdated?: () => void | Promise<void>;
}

const TemplateActions = ({ templateConfig, onTemplateConfigUpdated }: TemplateActionsProps) => {
  const templateDir = useEditorStore.use.subPage();

  const [applyTemplateDialogIsOpen, setApplyTemplateDialogIsOpen] = useState(false);
  const [configDialogIsOpen, setConfigDialogIsOpen] = useState(false);
  const [isTextReadMode, setIsTextReadMode] = useState(false);

  const [gameList, setGameList] = useState<GameInfoDto[]>([]);
  const [selectedGameDirs, setSelectedGameDirs] = useState<string[]>([]);

  const isGameUsingCurrentTemplate = (game: GameInfoDto) => {
    const gameTemplate = game.template;
    if (!gameTemplate) return false;
    if (templateConfig?.id && gameTemplate.id) return gameTemplate.id === templateConfig.id;
    const currentTemplateName = templateConfig?.name ?? templateDir;
    return gameTemplate.name === currentTemplateName || gameTemplate.name === templateDir;
  };

  const getGameList = async () => {
    const gameList = (await api.manageGameControllerGetGameList()).data;
    const selectedGameDirs = gameList.filter(isGameUsingCurrentTemplate).map((game) => game.dir);
    setGameList(gameList);
    setSelectedGameDirs(selectedGameDirs);
  };

  const getGameTemplateName = (game: GameInfoDto) => game.template?.name ?? t`无`;

  const applyTemplate = async () => {
    const apply = selectedGameDirs.map(async (gameDir) => await api.manageTemplateControllerApplyTemplateToGame({gameDir, templateDir}));
    await Promise.all(apply);
    setApplyTemplateDialogIsOpen(false);
  };

  const toggleTextReadMode = () => {
    const nextMode = !isTextReadMode;
    setIsTextReadMode(nextMode);
    EditorPreviewClient.setTextReadMode(nextMode);
  };

  return (
    <>
      <div className={styles.actions}>
        <AppSettingsButton appearance="transparent" className={styles.actionButton} />
        <Button
          className={styles.actionButton}
          appearance='transparent'
          icon={<Settings20Regular />}
          aria-label={t`配置模板`}
          title={t`配置模板`}
          onClick={() => setConfigDialogIsOpen(true)}
        >
          {t`配置模板`}
        </Button>
        <Button
          className={styles.actionButton}
          appearance='transparent'
          aria-pressed={isTextReadMode}
          icon={isTextReadMode ? <TextboxCheckmark20Regular /> : <Textbox20Regular />}
          aria-label={isTextReadMode ? t`将文本框文本设置为未读` : t`将文本框文本设置为已读`}
          title={isTextReadMode ? t`将文本框文本设置为未读` : t`将文本框文本设置为已读`}
          onClick={toggleTextReadMode}
        >
          {isTextReadMode ? t`将文本框文本设置为未读` : t`将文本框文本设置为已读`}
        </Button>
        <Button
          className={styles.actionButton}
          appearance='transparent'
          icon={<PlugConnected20Regular />}
          aria-label={t`将当前模板应用到选定的游戏`}
          title={t`将当前模板应用到选定的游戏`}
          onClick={() => {
            setApplyTemplateDialogIsOpen(true);
            getGameList();
          }}
        >
          {t`将当前模板应用到选定的游戏`}
        </Button>
      </div>

      <TemplateConfigDialog
        open={configDialogIsOpen}
        templateConfig={templateConfig}
        templateDir={templateDir}
        onOpenChange={setConfigDialogIsOpen}
        onTemplateConfigUpdated={onTemplateConfigUpdated}
      />

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
                              {t`使用中的模板：` + getGameTemplateName(game)}
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

function TemplateActionsReSizer() {
  const templateActionsHeight = useTemplateEditorContext((state) => state.templateActionsHeight);
  const updateTemplateActionsHeight = useTemplateEditorContext((state) => state.updateTemplateActionsHeight);

  return (
    <SidebarBlockResizer
      height={templateActionsHeight}
      minHeight={42}
      onResize={updateTemplateActionsHeight}
    />
  );
}

function ComponentTreeReSizer() {
  const componentTreeHeight = useTemplateEditorContext((state) => state.componentTreeHeight);
  const updateComponentTreeHeight = useTemplateEditorContext((state) => state.updateComponentTreeHeight);

  return (
    <SidebarBlockResizer
      height={componentTreeHeight}
      minHeight={0}
      onResize={updateComponentTreeHeight}
    />
  );
}

interface SidebarBlockResizerProps {
  height: number;
  minHeight: number;
  onResize: (height: number) => void;
}

function SidebarBlockResizer({height, minHeight, onResize}: SidebarBlockResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastYRef = useRef(0);
  const heightRef = useRef(height);

  useEffect(() => {
    if (!isDragging) {
      heightRef.current = height;
    }
  }, [height, isDragging]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    heightRef.current = height;
    lastYRef.current = event.clientY;
    setIsDragging(true);
  };

  useEffect(
    () => {
      if (!isDragging) return;

      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      const moveHandler = (event: MouseEvent) => {
        if (!isDragging) return;
        event.preventDefault();
        const deltaY = event.clientY - lastYRef.current;
        const newHeight = Math.max(minHeight, heightRef.current + deltaY);
        heightRef.current = newHeight;
        lastYRef.current = event.clientY;
        onResize(newHeight);
      };

      const upHandler = () => {
        setIsDragging(false);
      };

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);

      return () => {
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      };
    },
    [isDragging, minHeight, onResize]
  );

  return (
    <div
      className={`${styles.divider} ${isDragging ? styles.dividerActive : ''}`}
      onMouseDown={handleMouseDown}>
      <div className={styles.dividerLine}/>
    </div>
  );
}
