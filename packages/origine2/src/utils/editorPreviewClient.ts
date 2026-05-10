import useEditorStore from '@/store/useEditorStore';
import { createId } from '@/utils/createId';
import { eventBus } from '@/utils/eventBus';
import { getWsUrl } from '@/utils/getWsUrl';
import { logger } from '@/utils/logger';
import { createEditorPreviewTransport, type EditorPreviewTransport } from '@/utils/editorPreviewTransport';
import {
  createRequestEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
  isHostEventEnvelope,
  type EventEnvelope,
  type FastPreviewTimeoutPayload,
  type PreviewCommandType,
  type PreviewReadyUpdatedPayload,
  type RequestPayloadByType,
  type SetComponentVisibilityPayload,
  type SetEffectPayload,
  type StageSnapshotUpdatedPayload,
} from '@webgal/editor-preview-protocol';

let editorPreviewTransport: EditorPreviewTransport | null = null;
let editorPreviewClientStarted = false;
let lifecycleBound = false;
let lastStageSnapshot: StageSnapshotUpdatedPayload | null = null;

interface SyncSceneInput {
  scenePath: string;
  lineNumber: number;
  lineCommandString: string;
  force?: boolean;
}

type HostEventEnvelope =
  | EventEnvelope<PreviewReadyUpdatedPayload, 'preview.ready.updated'>
  | EventEnvelope<StageSnapshotUpdatedPayload, 'stage.snapshot.updated'>
  | EventEnvelope<
      FastPreviewTimeoutPayload,
      'preview.event.fast-preview-timeout'
    >;

function normalizeSceneName(scenePath: string): string {
  const normalizedPath = scenePath.replace(/\\/g, '/');
  const parts = normalizedPath.split('/');
  const sceneIndex = parts.indexOf('scene');
  if (sceneIndex < 0) {
    return normalizedPath;
  }

  return parts.slice(sceneIndex + 1).join('/');
}

function shouldSyncCurrentLine(currentLineValue: string | null): boolean {
  const command = currentLineValue?.split(':')[0] ?? '';
  if (command === 'unlockCg' || command === 'unlockBgm') {
    return !!currentLineValue?.match(/;/g);
  }

  return true;
}

function parseHostEvent(rawData: unknown): HostEventEnvelope | undefined {
  let parsedMessage: unknown;
  try {
    parsedMessage = JSON.parse(String(rawData));
  } catch (error) {
    logger.warn('解析编辑器预览同步 V1 消息失败', error);
    return undefined;
  }

  if (!isHostEventEnvelope(parsedMessage)) {
    return undefined;
  }

  return parsedMessage;
}

function consumeHostEvent(event: HostEventEnvelope) {
  switch (event.type) {
  case 'preview.ready.updated':
    eventBus.emit('editor-preview:ready', event.payload);
    return;
  case 'stage.snapshot.updated':
    lastStageSnapshot = event.payload;
    eventBus.emit('editor-preview:stage-snapshot', {
      snapshot: event.payload,
    });
    return;
  case 'preview.event.fast-preview-timeout':
    eventBus.emit('editor-preview:fast-preview-timeout', {
      payload: event.payload,
    });
    return;
  }
}

function handleIncomingMessage(rawData: unknown) {
  const hostEvent = parseHostEvent(rawData);
  if (!hostEvent) {
    return;
  }

  consumeHostEvent(hostEvent);
}

function bindLifecycleEvents() {
  if (lifecycleBound) {
    return;
  }

  lifecycleBound = true;
  const ensureConnected = () => {
    editorPreviewTransport?.ensureConnected();
  };

  window.addEventListener('focus', ensureConnected);
  window.addEventListener('online', ensureConnected);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ensureConnected();
    }
  });
}

function ensureEditorPreviewClientStarted() {
  if (editorPreviewClientStarted) {
    return;
  }

  const wsUrl = getWsUrl('api/webgalsync');
  if (!wsUrl) {
    logger.info('当前环境不支持启动编辑器预览同步 V1 WebSocket');
    return;
  }

  editorPreviewTransport = createEditorPreviewTransport({
    url: wsUrl,
    subprotocol: EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    onMessage: handleIncomingMessage,
    logInfo: (message) => logger.info(message),
    logError: (message, error) => logger.error(message, error),
    logWarn: (message, error) => logger.warn(message, error),
  });
  editorPreviewClientStarted = true;
  bindLifecycleEvents();
  editorPreviewTransport.connect();
}

function sendPreviewCommand<TType extends PreviewCommandType>(
  type: TType,
  payload: RequestPayloadByType[TType],
): boolean {
  ensureEditorPreviewClientStarted();
  editorPreviewTransport?.ensureConnected();
  if (!editorPreviewTransport) {
    return false;
  }

  return editorPreviewTransport.send(createRequestEnvelope(type, createId(), payload));
}

export class EditorPreviewClient {
  public static ensureConnected() {
    ensureEditorPreviewClientStarted();
    editorPreviewTransport?.ensureConnected();
  }

  public static getLastStageSnapshot() {
    return lastStageSnapshot;
  }

  public static sendSyncScene({
    scenePath,
    lineNumber,
    lineCommandString,
    force = false,
  }: SyncSceneInput) {
    const editorState = useEditorStore.getState();
    if (!editorState.isEnableLivePreview && !force) {
      return false;
    }

    if (!shouldSyncCurrentLine(lineCommandString)) {
      return false;
    }

    return sendPreviewCommand('preview.command.sync-scene', {
      sceneName: normalizeSceneName(scenePath),
      sentenceId: lineNumber,
      syncMode: editorState.isUseExpFastSync ? 'fast' : 'stable',
    });
  }

  public static runSnippet(snippet: string) {
    return sendPreviewCommand('preview.command.run-snippet', {
      snippet,
    });
  }

  public static runSceneContent(sceneContent: string) {
    return sendPreviewCommand('preview.command.run-scene-content', {
      sceneContent,
    });
  }

  public static reloadTemplates() {
    return sendPreviewCommand('preview.command.reload-templates', {});
  }

  public static setFontOptimization(enabled: boolean) {
    return sendPreviewCommand('preview.command.set-font-optimization', {
      enabled,
    });
  }

  public static setTextReadMode(isRead: boolean) {
    return sendPreviewCommand('preview.command.set-text-read-mode', {
      isRead,
    });
  }

  public static setEffect(payload: SetEffectPayload) {
    return sendPreviewCommand('preview.command.set-effect', payload);
  }

  public static setComponentVisibility(
    payload: SetComponentVisibilityPayload,
  ) {
    return sendPreviewCommand('preview.command.set-component-visibility', payload);
  }
}
