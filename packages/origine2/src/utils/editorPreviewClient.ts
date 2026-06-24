import useEditorStore from '@/store/useEditorStore';
import type { IDebugVariable } from '@/types/editor';
import { createId } from '@/utils/createId';
import { eventBus } from '@/utils/eventBus';
import { getWsUrl } from '@/utils/getWsUrl';
import { logger } from '@/utils/logger';
import { createEditorPreviewTransport, type EditorPreviewTransport } from '@/utils/editorPreviewTransport';
import { EditorPreviewRequestOwner } from '@/utils/editorPreviewRequestOwner';
import {
  createRequestEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
  isHostEventEnvelope,
  isKnownProtocolEnvelope,
  type EventEnvelope,
  type BaseTransformQueryResultPayload,
  type DebugVariable,
  type FastPreviewTimeoutPayload,
  type PreviewCommandType,
  type ReferenceBoxQueryResultPayload,
  type PreviewReadyUpdatedPayload,
  type RequestPayloadByType,
  type SetComponentVisibilityPayload,
  type SetEffectPayload,
  type SyncSceneSettleMode,
  type StageSnapshotUpdatedPayload,
  type TransformBaselineQueryResultPayload,
} from '@webgal/editor-preview-protocol';

let editorPreviewTransport: EditorPreviewTransport | null = null;
let editorPreviewClientStarted = false;
let lifecycleBound = false;
let lastStageSnapshot: StageSnapshotUpdatedPayload | null = null;
let baseTransformCache: BaseTransformQueryResultPayload | null = null;
let queryCapabilityState: PreviewQueryCapabilityState = 'unknown';

const PREVIEW_QUERY_TIMEOUT_MS = 300;
const TRANSFORM_BASELINE_MAX_RETRIES = 3;
const TRANSFORM_BASELINE_RETRY_DELAY_MS = 50;

type PreviewQueryCapabilityState =
  | 'unknown'
  | 'probing'
  | 'supported'
  | 'unsupported';

const previewRequestOwner = new EditorPreviewRequestOwner({
  createRequestId: createId,
  send: (envelope) => {
    editorPreviewTransport?.ensureConnected();
    return editorPreviewTransport?.send(envelope) ?? false;
  },
});

interface SyncSceneInput {
  scenePath: string;
  lineNumber: number;
  lineCommandString: string;
  force?: boolean;
  settleMode?: SyncSceneSettleMode;
  transformBaselineRevision?: string;
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

function parseProtocolEnvelope(rawData: unknown) {
  let parsedMessage: unknown;
  try {
    parsedMessage = JSON.parse(String(rawData));
  } catch (error) {
    logger.warn('解析编辑器预览同步 V1 消息失败', error);
    return undefined;
  }

  if (!isKnownProtocolEnvelope(parsedMessage)) {
    return undefined;
  }

  return parsedMessage;
}

function consumeHostEvent(event: HostEventEnvelope) {
  switch (event.type) {
  case 'preview.ready.updated':
    if (event.payload.ready) {
      startBaseTransformCapabilityProbe();
    } else {
      resetRuntimeLifecycleState();
    }
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
  const envelope = parseProtocolEnvelope(rawData);
  if (!envelope) {
    return;
  }

  if (previewRequestOwner.handleEnvelope(envelope)) {
    return;
  }

  if (isHostEventEnvelope(envelope)) {
    consumeHostEvent(envelope);
  }
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

function resetRuntimeLifecycleState() {
  baseTransformCache = null;
  queryCapabilityState = 'unknown';
  previewRequestOwner.rejectAll(new Error('编辑器预览同步 V1 WebSocket 已关闭'));
}

function markQueryCapabilityUnsupported() {
  if (queryCapabilityState === 'supported') {
    return;
  }

  queryCapabilityState = 'unsupported';
  baseTransformCache = null;
}

function startBaseTransformCapabilityProbe() {
  if (queryCapabilityState !== 'unknown') {
    return;
  }

  queryCapabilityState = 'probing';
  previewRequestOwner
    .sendPreviewRequest(
      'preview.query.base-transform',
      {},
      PREVIEW_QUERY_TIMEOUT_MS,
    )
    .then((payload) => {
      baseTransformCache = payload;
      queryCapabilityState = 'supported';
    })
    .catch((error) => {
      logger.warn('编辑器预览 runtime 不支持 transform query', error);
      markQueryCapabilityUnsupported();
    });
}

function sendPreviewRequest<
  TType extends
    | 'preview.query.reference-box'
    | 'preview.query.base-transform'
    | 'preview.query.transform-baseline',
>(
  type: TType,
  payload: RequestPayloadByType[TType],
  timeoutMs = PREVIEW_QUERY_TIMEOUT_MS,
) {
  ensureEditorPreviewClientStarted();
  editorPreviewTransport?.ensureConnected();
  return previewRequestOwner.sendPreviewRequest(type, payload, timeoutMs);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildDebugVariablesPayload(debugVariables: IDebugVariable[]): DebugVariable[] {
  return debugVariables
    .filter(item => item.key.trim())
    .map(item => ({
      key: item.key.trim(),
      value: item.value.trim(),
      isGlobal: item.isGlobal,
    }));
}

function getDebugVariablesPayload() {
  return buildDebugVariablesPayload(useEditorStore.getState().debugVariables);
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
    onClose: resetRuntimeLifecycleState,
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
    settleMode,
    transformBaselineRevision,
  }: SyncSceneInput) {
    const editorState = useEditorStore.getState();
    if (!editorState.isEnableLivePreview && !force) {
      return false;
    }

    if (!shouldSyncCurrentLine(lineCommandString)) {
      return false;
    }

    const payload: RequestPayloadByType['preview.command.sync-scene'] & {
      legacySyncMessage: 'Sync' | 'exp';
    } = {
      sceneName: normalizeSceneName(scenePath),
      sentenceId: lineNumber,
      legacySyncMessage: editorState.isUseExpFastSync ? 'exp' : 'Sync',
      ...(settleMode !== undefined ? { settleMode } : {}),
      ...(transformBaselineRevision !== undefined ? { transformBaselineRevision } : {}),
      debugVariables: getDebugVariablesPayload(),
    };

    return sendPreviewCommand(
      'preview.command.sync-scene',
      payload,
    );
  }

  public static runSnippet(snippet: string) {
    return sendPreviewCommand('preview.command.run-snippet', {
      snippet,
      debugVariables: getDebugVariablesPayload(),
    });
  }

  public static runSceneContent(sceneContent: string) {
    return sendPreviewCommand('preview.command.run-scene-content', {
      sceneContent,
      debugVariables: getDebugVariablesPayload(),
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

  public static getPreviewQueryCapabilityState() {
    return queryCapabilityState;
  }

  public static queryReferenceBox(
    target: string,
  ): Promise<ReferenceBoxQueryResultPayload> {
    return sendPreviewRequest(
      'preview.query.reference-box',
      { target },
      PREVIEW_QUERY_TIMEOUT_MS,
    );
  }

  public static async queryBaseTransform(): Promise<BaseTransformQueryResultPayload> {
    if (baseTransformCache) {
      return baseTransformCache;
    }

    try {
      const payload = await sendPreviewRequest(
        'preview.query.base-transform',
        {},
        PREVIEW_QUERY_TIMEOUT_MS,
      );
      baseTransformCache = payload;
      queryCapabilityState = 'supported';
      return payload;
    } catch (error) {
      markQueryCapabilityUnsupported();
      throw error;
    }
  }

  public static async queryTransformBaseline(
    target: string,
    transformBaselineRevision: string,
  ): Promise<TransformBaselineQueryResultPayload> {
    for (let attempt = 0; attempt <= TRANSFORM_BASELINE_MAX_RETRIES; attempt += 1) {
      const payload = await sendPreviewRequest(
        'preview.query.transform-baseline',
        {
          target,
          transformBaselineRevision,
        },
        PREVIEW_QUERY_TIMEOUT_MS,
      );

      if (payload.status !== 'loading' || attempt === TRANSFORM_BASELINE_MAX_RETRIES) {
        return payload;
      }

      await wait(TRANSFORM_BASELINE_RETRY_DELAY_MS);
    }

    return { status: 'unavailable' };
  }
}
