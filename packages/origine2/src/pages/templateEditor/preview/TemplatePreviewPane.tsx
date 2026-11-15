/* eslint-disable react/iframe-missing-sandbox */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Switch, Tooltip } from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  OpenRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import type {
  ApplyStyleIgnoredPayload,
  UiPartDescriptor,
  UiPreviewMode,
} from '@webgal/editor-preview-protocol';
import { createId } from '@/utils/createId';
import { createPreviewBootstrapProvide, isPreviewBootstrapRequest } from '@/utils/editorPreviewBootstrap';
import { EditorPreviewClient } from '@/utils/editorPreviewClient';
import { PartOverlayLayer } from './PartOverlayLayer';
import styles from './templatePreviewPane.module.scss';

interface ITemplatePreviewPaneProps {
  templateDir: string;
  previewMode: UiPreviewMode;
  useMockData: boolean;
  parts: UiPartDescriptor[];
  selectedPartId: string | null;
  scssText: string;
  applyStyleIgnored: ApplyStyleIgnoredPayload | null;
  onChangePreviewMode: (mode: UiPreviewMode) => void;
  onChangeMockData: (enabled: boolean) => void;
  onSelectPart: (partId: string) => void;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
}

export function TemplatePreviewPane({
  templateDir,
  previewMode,
  useMockData,
  parts,
  selectedPartId,
  scssText,
  applyStyleIgnored,
  onChangePreviewMode,
  onChangeMockData,
  onSelectPart,
  onPreviewScss,
  onCommitScss,
}: ITemplatePreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const embeddedLaunchIdRef = useRef(createId());
  const [reloadNonce, setReloadNonce] = useState(0);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({
    width: 640,
    height: 360,
  });

  useEffect(() => {
    EditorPreviewClient.ensureConnected();

    const handleBootstrapMessage = (event: MessageEvent) => {
      const iframeWindow = iframeRef.current?.contentWindow;
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
    const container = viewportRef.current;
    if (!container) return;

    const updateSize = () => {
      const padding = 16;
      const availW = Math.max(160, container.clientWidth - padding);
      const availH = Math.max(90, container.clientHeight - padding);
      const width = Math.min(availW, (availH * 16) / 9);
      const height = (width * 9) / 16;
      setStageSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const previewUrl = useMemo(
    () => `/template-preview/${encodeURIComponent(templateDir)}/${reloadNonce > 0 ? `?r=${reloadNonce}` : ''}`,
    [templateDir, reloadNonce],
  );

  const handleRefresh = () => {
    embeddedLaunchIdRef.current = createId();
    setReloadNonce((n) => n + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(`/template-preview/${encodeURIComponent(templateDir)}/`, '_blank');
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.modeGroup}>
          <button
            type="button"
            className={`${styles.modeButton} ${previewMode === 'edit' ? styles.modeButtonActive : ''}`}
            onClick={() => onChangePreviewMode('edit')}
          >
            {t`画布编辑`}
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${previewMode === 'interactive' ? styles.modeButtonActive : ''}`}
            onClick={() => onChangePreviewMode('interactive')}
          >
            {t`预览交互`}
          </button>
        </div>

        <Switch
          label={t`模拟数据`}
          checked={useMockData}
          onChange={(_ev, data) => onChangeMockData(data.checked)}
        />

        <div className={styles.toolbarSpacer} />

        {applyStyleIgnored && (
          <Tooltip content={applyStyleIgnored.content || applyStyleIgnored.reason} relationship="label">
            <span className={styles.applyStyleBadge}>
              <WarningRegular />
              <span>{t`applyStyle 已覆盖`}</span>
            </span>
          </Tooltip>
        )}

        <Tooltip content={t`刷新预览`} relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowClockwiseRegular />}
            onClick={handleRefresh}
          />
        </Tooltip>

        <Tooltip content={t`在新标签页打开`} relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<OpenRegular />}
            onClick={handleOpenInNewTab}
          />
        </Tooltip>
      </div>

      <div className={styles.viewport} ref={viewportRef}>
        <div
          className={styles.stageBox}
          style={{ width: `${stageSize.width}px`, height: `${stageSize.height}px` }}
        >
          <iframe
            ref={iframeRef}
            id="templatePreviewIframe"
            title={templateDir}
            frameBorder={0}
            className={styles.iframe}
            src={previewUrl}
          />
          {previewMode === 'edit' && (
            <PartOverlayLayer
              parts={parts}
              selectedPartId={selectedPartId}
              stageWidth={stageSize.width}
              stageHeight={stageSize.height}
              scssText={scssText}
              onSelectPart={onSelectPart}
              onPreviewScss={onPreviewScss}
              onCommitScss={onCommitScss}
            />
          )}
        </div>
      </div>
    </div>
  );
}
