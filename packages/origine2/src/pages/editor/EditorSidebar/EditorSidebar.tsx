import styles from './editorSidebar.module.scss';
import Assets, { IFileConfig, IFileFunction } from '@/components/Assets/Assets';
import SplitPane from '@/components/SplitPane/SplitPane';
import React, { useEffect, useRef } from 'react';
import { eventBus } from '@/utils/eventBus';
import { Button, Switch, Tab, TabList } from '@fluentui/react-components';
import useEditorStore from '@/store/useEditorStore';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import { IGameEditorSidebarTabs, ITag } from '@/types/gameEditor';
import { t } from '@lingui/macro';
import {
  ArrowClockwiseFilled,
  ArrowClockwiseRegular,
  LiveFilled,
  LiveOffFilled,
  LiveOffRegular,
  LiveRegular,
  OpenFilled,
  OpenRegular,
  bundleIcon,
} from '@fluentui/react-icons';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { createPreviewBootstrapProvide, isPreviewBootstrapRequest } from '@/utils/editorPreviewBootstrap';
import { createId } from '@/utils/createId';

const ArrowClockwiseIcon = bundleIcon(ArrowClockwiseFilled, ArrowClockwiseRegular);
const OpenIcon = bundleIcon(OpenFilled, OpenRegular);
const LiveIcon = bundleIcon(LiveFilled, LiveRegular);
const LiveOffIcon = bundleIcon(LiveOffFilled, LiveOffRegular);

export default function EditorSideBar() {
  const gameDir = useEditorStore.use.subPage();
  const isEnableLivePreview = useEditorStore.use.isEnableLivePreview();
  const updateIsEnableLivePreview = useEditorStore.use.updateIsEnableLivePreview();
  const isUseFontOptimization = useEditorStore.use.isUseFontOptimization();
  const isShowPreview = useEditorStore.use.isShowPreview();
  const updateIsShowPreview = useEditorStore.use.updateIsShowPreview();

  const isShowSidebar = useGameEditorContext((state) => state.isShowSidebar);
  const currentSidebarTab = useGameEditorContext((state) => state.currentSidebarTab);
  const updateCurrentSidebarTab = useGameEditorContext((state) => state.updateCurrentSidebarTab);
  const tags = useGameEditorContext((state) => state.tags);
  const addTag = useGameEditorContext((state) => state.addTag);
  const updateCurrentTag = useGameEditorContext((state) => state.updateCurrentTag);
  const PreviewControlRef = useRef(null);

  // 预览区初始高度：按侧栏默认宽度（35% 视口）的 16:9 高度 + 顶部按钮行高度估算
  const defaultPreviewHeight = Math.round(window.innerWidth * 0.35 * (9 / 16)) + 40;

  const ifRef = useRef<HTMLIFrameElement | null>(null);
  const embeddedLaunchIdRef = useRef(createId());

  useEffect(() => {
    EditorPreviewClient.ensureConnected();
  }, []);

  useEffect(() => {
    const handleBootstrapMessage = (event: MessageEvent) => {
      const iframeWindow = ifRef.current?.contentWindow;
      if (!iframeWindow || event.source !== iframeWindow || !isPreviewBootstrapRequest(event.data)) {
        return;
      }

      iframeWindow.postMessage(createPreviewBootstrapProvide(embeddedLaunchIdRef.current), '*');
    };

    window.addEventListener('message', handleBootstrapMessage);
    return () => {
      window.removeEventListener('message', handleBootstrapMessage);
    };
  }, []);

  useEffect(() => {
    if (isShowPreview) {
      embeddedLaunchIdRef.current = createId();
    }
  }, [gameDir, isShowPreview]);

  useEffect(() => {
    const iframeElement = ifRef.current;
    if (!iframeElement) {
      return;
    }

    iframeElement.onload = () => {
      const iframeWindow = iframeElement.contentWindow;
      if (!iframeWindow) {
        return;
      }

      (iframeWindow as Window & { console: { log: (...args: unknown[]) => void } }).console.log = function () {};
    };

    return () => {
      iframeElement.onload = null;
    };
  }, [gameDir, isShowPreview]);

  useEffect(() => {
    const handlePreviewReady = ({ ready }: { ready: boolean }) => {
      if (!ready) {
        return;
      }

      EditorPreviewClient.setFontOptimization(isUseFontOptimization);
      if (isEnableLivePreview) eventBus.emit('editor:sync-current-line', null);
    };

    eventBus.on('editor-preview:ready', handlePreviewReady);
    return () => {
      eventBus.off('editor-preview:ready', handlePreviewReady);
    };
  }, [isEnableLivePreview, isUseFontOptimization]);

  useEffect(() => {
    EditorPreviewClient.setFontOptimization(isUseFontOptimization);
  }, [isUseFontOptimization]);

  const refreshGame = () => {
    embeddedLaunchIdRef.current = createId();
    ifRef.current?.contentWindow?.location.reload();
  };

  useEffect(() => {
    eventBus.on('iframe:refresh-game', refreshGame);
    return () => {
      eventBus.off('iframe:refresh-game', refreshGame);
    };
  }, []);

  const openFlowchartEditor = () => {
    const flowchartTag: ITag = {
      name: t`流程图编辑器`,
      path: 'flowchart',
      type: 'flowchart',
    };
    const result = tags.findIndex((e) => e.path === flowchartTag.path);
    if (result < 0) addTag(flowchartTag);
    updateCurrentTag(flowchartTag);
  };

  useEffect(() => {
    eventBus.on('openFlowchartEditor', openFlowchartEditor);
    return () => {
      eventBus.off('openFlowchartEditor', openFlowchartEditor);
    };
  }, [tags]);

  const fileConfig: IFileConfig = new Map([
    [`animation`, { desc: t`动画`, extNameTypes: ['json'], isProtected: true }],
    [`animation/animationTable.json`, { isProtected: true }],
    [`background`, { desc: t`背景`, extNameTypes: ['image', 'video'], isProtected: true }],
    [`bgm`, { desc: t`音乐`, extNameTypes: ['audio'], isProtected: true }],
    [`figure`, { desc: t`立绘`, extNameTypes: ['image', 'json'], isProtected: true }],
    [`scene`, { desc: t`场景`, extNameTypes: ['scene'], isProtected: true }],
    [`scene/start.txt`, { isProtected: true }],
    [`template`, { desc: t`模板`, isProtected: true }],
    [`tex`, { desc: t`纹理`, extNameTypes: ['tex'], isProtected: true }],
    [`video`, { desc: t`视频`, extNameTypes: ['video'], isProtected: true }],
    [`vocal`, { desc: t`语音`, extNameTypes: ['audio'], isProtected: true }],
    [`config.txt`, { desc: t`游戏配置`, isProtected: true }],
    [`userStyleSheet.css`, { isProtected: true }],
  ]);

  const handleOpen: IFileFunction['open'] = async (file, type) => {
    const target = file.path;
    const tag: ITag = {
      name: file.name,
      path: file.path,
      type: type,
    };
    // 先要确定没有这个tag
    const result = tags.findIndex((e) => e.path === target);
    if (result < 0) addTag(tag);
    updateCurrentTag(tag);
  };

  const fileFunction: IFileFunction = {
    open: handleOpen,
  };

  const assetsTabs = (
    <TabList
      style={{ padding: '0 3px 0 4px' }}
      size="small"
      selectedValue={currentSidebarTab}
      onTabSelect={(_, data) => updateCurrentSidebarTab(data.value as unknown as IGameEditorSidebarTabs)}
    >
      <Tab value="asset" style={{ padding: '2px 2px 3.5px 2px' }}>{t`资源`}</Tab>
      <Tab value="scene" style={{ padding: '2px 2px 3.5px 2px' }}>{t`场景`}</Tab>
    </TabList>
  );

  return (
    <>
      {isShowSidebar && (
        <div className={styles.editor_sidebar}>
          <SplitPane
            direction="vertical"
            defaultSize={defaultPreviewHeight}
            minSize={96}
            persistKey="editor-preview-height"
            fixedPanel="first"
            disablePointerOn="#gamePreviewIframe"
          >
            <div className={styles.preview_container} id="gamePreview">
              <div className={styles.gamePreviewButons}>
                <Switch
                  label={t`预览窗口`}
                  labelPosition="before"
                  checked={isShowPreview}
                  onChange={() => updateIsShowPreview(!isShowPreview)}
                />
                <div style={{ flexGrow: 1 }} />
                <Button
                  appearance="transparent"
                  icon={<ArrowClockwiseIcon />}
                  title={t`刷新游戏`}
                  onClick={refreshGame}
                />
                <Button
                  appearance="subtle"
                  icon={<OpenIcon />}
                  title={t`在新标签页中预览`}
                  onClick={() => window.open(`/games/${gameDir}`, '_blank')}
                />
                <Button
                  appearance="subtle"
                  icon={isEnableLivePreview ? <LiveIcon /> : <LiveOffIcon />}
                  title={isEnableLivePreview ? t`实时预览打开` : t`实时预览关闭`}
                  onClick={() => updateIsEnableLivePreview(!isEnableLivePreview)}
                />
              </div>
              <div className={styles.previewArea}>
                {/* 16:9 舞台：同时作为变换调整覆盖层（TransformableBox）的定位基准 */}
                <div
                  ref={PreviewControlRef}
                  id="gamePreviewControl"
                  className={styles.previewControl}
                  style={{ display: isShowPreview ? 'block' : 'none' }}
                >
                  {isShowPreview && (
                    // eslint-disable-next-line react/iframe-missing-sandbox
                    <iframe
                      ref={ifRef}
                      id="gamePreviewIframe"
                      frameBorder="0"
                      className={styles.previewWindow}
                      src={`/games/${gameDir}`}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sidebarContent}>
              {currentSidebarTab === 'asset' && (
                <Assets
                  rootPath={['games', gameDir, 'game']}
                  leading={assetsTabs}
                  fileConfig={fileConfig}
                  fileFunction={fileFunction}
                />
              )}
              {currentSidebarTab === 'scene' && (
                <Assets
                  rootPath={['games', gameDir, 'game']}
                  basePath={['scene']}
                  leading={assetsTabs}
                  fileConfig={fileConfig}
                  fileFunction={fileFunction}
                />
              )}
            </div>
          </SplitPane>
        </div>
      )}
    </>
  );
}
