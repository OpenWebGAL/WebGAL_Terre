import useEditorStore from '@/store/useEditorStore';
import usePreviewRuntimeStore from '@/store/usePreviewRuntimeStore';
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
  type ApplyStyleIgnoredPayload,
  type EventEnvelopeByType,
  type BaseTransformQueryResultPayload,
  type DebugVariable,
  type HostEventType,
  type PreviewCommandType,
  type ReferenceBoxQueryResultPayload,
  type RequestPayloadByType,
  type SeekAnimationPayload,
  type SelectUiPartPayload,
  type SetActiveUiScreenPayload,
  type SetComponentVisibilityPayload,
  type SetEffectPayload,
  type SetUiEditModePayload,
  type SetUiMockDataPayload,
  type SetUiPartStylePayload,
  type SetUiPseudoStatePayload,
  type SyncSceneSettleMode,
  type StageSnapshotUpdatedPayload,
  type TransformBaselineQueryResultPayload,
  type UiPartSelectedPayload,
  type UiScreenUpdatedPayload,
} from '@webgal/editor-preview-protocol';

export interface UiEditorEventHandlers {
  onScreenUpdated?: (payload: UiScreenUpdatedPayload) => void;
  onPartSelected?: (payload: UiPartSelectedPayload) => void;
  onApplyStyleIgnored?: (payload: ApplyStyleIgnoredPayload) => void;
}

let editorPreviewTransport: EditorPreviewTransport | null = null;
let editorPreviewClientStarted = false;
let lifecycleBound = false;
let lastStageSnapshot: StageSnapshotUpdatedPayload | null = null;
let lastUiScreenPayload: UiScreenUpdatedPayload | null = null;
let baseTransformCache: BaseTransformQueryResultPayload | null = null;
let queryCapabilityState: PreviewQueryCapabilityState = 'unknown';
const uiEventSubscribers = new Set<UiEditorEventHandlers>();

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

type HostEventEnvelope = EventEnvelopeByType<HostEventType>;

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
  case 'preview.version.updated':
    usePreviewRuntimeStore.getState().updateVersion(event.payload.version);
    return;
  case 'preview.template.updated':
    usePreviewRuntimeStore.getState().updateTemplate(event.payload.template);
    return;
  case 'preview.game-info.updated':
    usePreviewRuntimeStore.getState().updateGameInfo(event.payload.gameInfo);
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
  case 'ui.screen.updated':
    lastUiScreenPayload = event.payload;
    uiEventSubscribers.forEach((handler) => handler.onScreenUpdated?.(event.payload));
    return;
  case 'ui.part.selected':
    uiEventSubscribers.forEach((handler) => handler.onPartSelected?.(event.payload));
    return;
  case 'preview.event.apply-style-ignored':
    uiEventSubscribers.forEach((handler) => handler.onApplyStyleIgnored?.(event.payload));
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

  if (!isHostEventEnvelope(envelope)) {
    return;
  }

  // 独占预览的事件只交给持有它的编辑器组件，不影响主预览的状态
  if (envelope.embeddedLaunchId) {
    eventBus.emit('editor-preview:dedicated-event', envelope);
    return;
  }

  consumeHostEvent(envelope);
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
  lastUiScreenPayload = null;
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
    | 'preview.query.transform-baseline'
    | 'preview.query.ui-screen',
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

/**
 * @param embeddedLaunchId 指定时只发给这个独占预览，见 DEDICATED_PREVIEW_LAUNCH_ID_PREFIX
 */
function sendPreviewCommand<TType extends PreviewCommandType>(
  type: TType,
  payload: RequestPayloadByType[TType],
  embeddedLaunchId?: string,
): boolean {
  ensureEditorPreviewClientStarted();
  editorPreviewTransport?.ensureConnected();
  if (!editorPreviewTransport) {
    return false;
  }

  return editorPreviewTransport.send({ ...createRequestEnvelope(type, createId(), payload), embeddedLaunchId });
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

  public static seekAnimation(payload: SeekAnimationPayload) {
    return sendPreviewCommand('preview.command.seek-animation', payload);
  }

  public static setComponentVisibility(
    payload: SetComponentVisibilityPayload,
  ) {
    return sendPreviewCommand('preview.command.set-component-visibility', payload);
  }

  public static sendToDedicatedPreview<TType extends PreviewCommandType>(
    embeddedLaunchId: string,
    type: TType,
    payload: RequestPayloadByType[TType],
  ) {
    return sendPreviewCommand(type, payload, embeddedLaunchId);
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

  public static subscribeUiEvents(handlers: UiEditorEventHandlers): () => void {
    uiEventSubscribers.add(handlers);
    return () => {
      uiEventSubscribers.delete(handlers);
    };
  }

  public static getLastUiScreenPayload(): UiScreenUpdatedPayload | null {
    return lastUiScreenPayload;
  }

  public static setUiEditMode(payload: SetUiEditModePayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.set-ui-edit-mode', payload, embeddedLaunchId);
  }

  public static setActiveUiScreen(payload: SetActiveUiScreenPayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.set-active-ui-screen', payload, embeddedLaunchId);
  }

  public static selectUiPart(payload: SelectUiPartPayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.select-ui-part', payload, embeddedLaunchId);
  }

  public static setUiPartStyle(payload: SetUiPartStylePayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.set-ui-part-style', payload, embeddedLaunchId);
  }

  public static setUiPseudoState(payload: SetUiPseudoStatePayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.set-ui-pseudo-state', payload, embeddedLaunchId);
  }

  public static setUiMockData(payload: SetUiMockDataPayload, embeddedLaunchId?: string) {
    return sendPreviewCommand('preview.command.set-ui-mock-data', payload, embeddedLaunchId);
  }

  public static queryUiScreen(): Promise<UiScreenUpdatedPayload> {
    return sendPreviewRequest('preview.query.ui-screen', {}, PREVIEW_QUERY_TIMEOUT_MS);
  }
}
