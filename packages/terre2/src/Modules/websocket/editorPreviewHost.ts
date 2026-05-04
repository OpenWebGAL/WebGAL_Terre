import type { IncomingMessage } from 'http';
import {
  createEventEnvelope,
  createResponseEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
  isPreviewCommandRequestEnvelope,
  isProtocolEnvelope,
  type EventEnvelope,
  type FastPreviewTimeoutPayload,
  type ProtocolEnvelope,
  type PreviewReadyUpdatedPayload,
  type RegisterPreviewRequestPayload,
  type ReloadTemplatesPayload,
  type RunSceneContentPayload,
  type RunSnippetPayload,
  type RequestEnvelope,
  type SetComponentVisibilityPayload,
  type SetEffectPayload,
  type SetFontOptimizationPayload,
  type SyncScenePayload,
  type StageSnapshotUpdatedPayload,
} from '@webgal/editor-preview-protocol';
import type WebSocket from 'ws';

export type HostConnectionKind = 'legacy' | 'v1' | 'rejected';

interface EditorPreviewHostOptions {
  forwardPreviewCommandToLegacy?: (
    envelope: PreviewCommandRequestEnvelope,
  ) => void;
}

interface LegacyEditorPreviewAdapterOptions {
  forwardHostEventToV1Editors?: (envelope: ForwardedHostEventEnvelope) => void;
}

type V1ConnectionRole = 'unknown' | 'editor' | 'preview';

interface V1ConnectionState {
  role: V1ConnectionRole;
  gameId?: string;
  embeddedLaunchId?: string;
}

const REGISTER_PREVIEW_TYPE = 'session.register-preview';
const FORWARDED_EVENT_TYPES = new Set([
  'preview.ready.updated',
  'stage.snapshot.updated',
  'preview.event.fast-preview-timeout',
]);

type ForwardedHostEventEnvelope =
  | EventEnvelope<PreviewReadyUpdatedPayload, 'preview.ready.updated'>
  | EventEnvelope<StageSnapshotUpdatedPayload, 'stage.snapshot.updated'>
  | EventEnvelope<
      FastPreviewTimeoutPayload,
      'preview.event.fast-preview-timeout'
    >;

type RegisterPreviewRequestEnvelope = RequestEnvelope<
  RegisterPreviewRequestPayload,
  typeof REGISTER_PREVIEW_TYPE
>;

type PreviewCommandRequestEnvelope =
  | RequestEnvelope<SyncScenePayload, 'preview.command.sync-scene'>
  | RequestEnvelope<RunSceneContentPayload, 'preview.command.run-scene-content'>
  | RequestEnvelope<RunSnippetPayload, 'preview.command.run-snippet'>
  | RequestEnvelope<ReloadTemplatesPayload, 'preview.command.reload-templates'>
  | RequestEnvelope<SetEffectPayload, 'preview.command.set-effect'>
  | RequestEnvelope<
      SetComponentVisibilityPayload,
      'preview.command.set-component-visibility'
    >
  | RequestEnvelope<
      SetFontOptimizationPayload,
      'preview.command.set-font-optimization'
    >;

const LEGACY_DEBUG_COMMAND = {
  JUMP: 0,
  SYNCFC: 1,
  EXE_COMMAND: 3,
  REFETCH_TEMPLATE_FILES: 4,
  SET_COMPONENT_VISIBILITY: 5,
  TEMP_SCENE: 6,
  FONT_OPTIMIZATION: 7,
  SET_EFFECT: 8,
  FAST_PREVIEW_TIMEOUT: 9,
} as const;

type LegacyDebugCommandValue =
  (typeof LEGACY_DEBUG_COMMAND)[keyof typeof LEGACY_DEBUG_COMMAND];

interface LegacyDebugEnvelope {
  event: string;
  data: {
    command: LegacyDebugCommandValue;
    sceneMsg: {
      sentence: number;
      scene: string;
    };
    message: string;
    stageSyncMsg: Record<string, unknown>;
  };
}

interface LegacyRawEnvelope {
  event: string;
  data: unknown;
}

interface LegacyFastPreviewTimeoutPayload {
  scene?: string;
  sceneName?: string;
  sentence?: number;
  sentenceId?: number;
  targetSentence?: number;
  targetSentenceId?: number;
  forwardedLineCount: number;
  elapsedMs: number;
  maxDurationMs: number;
}

function parseRequestedProtocols(request: IncomingMessage): string[] {
  const headerValue = request.headers['sec-websocket-protocol'];
  if (Array.isArray(headerValue)) {
    return headerValue
      .flatMap((item) => item.split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof headerValue !== 'string') {
    return [];
  }

  return headerValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isForwardedPreviewEvent(
  envelope: EventEnvelope,
): envelope is ForwardedHostEventEnvelope {
  return FORWARDED_EVENT_TYPES.has(envelope.type);
}

function isRegisterPreviewRequest(
  envelope: ProtocolEnvelope,
): envelope is RegisterPreviewRequestEnvelope {
  return envelope.kind === 'request' && envelope.type === REGISTER_PREVIEW_TYPE;
}

function sendEnvelope(socket: WebSocket, envelope: unknown) {
  socket.send(JSON.stringify(envelope));
}

function createLegacyDebugEnvelope(
  command: LegacyDebugCommandValue,
  options?: {
    scene?: string;
    sentence?: number;
    message?: string;
    stageSyncMsg?: Record<string, unknown>;
  },
): LegacyDebugEnvelope {
  return {
    event: 'message',
    data: {
      command,
      sceneMsg: {
        scene: options?.scene ?? '',
        sentence: options?.sentence ?? 0,
      },
      stageSyncMsg: options?.stageSyncMsg ?? {},
      message: options?.message ?? '',
    },
  };
}

function parseLegacyFastPreviewTimeoutPayload(
  rawMessage: string,
): FastPreviewTimeoutPayload | null {
  try {
    const payload = JSON.parse(rawMessage) as LegacyFastPreviewTimeoutPayload;
    const sceneName = payload.sceneName ?? payload.scene;
    const sentenceId = payload.sentenceId ?? payload.sentence;
    const targetSentenceId = payload.targetSentenceId ?? payload.targetSentence;
    if (
      typeof sceneName !== 'string' ||
      typeof sentenceId !== 'number' ||
      typeof targetSentenceId !== 'number' ||
      typeof payload.forwardedLineCount !== 'number' ||
      typeof payload.elapsedMs !== 'number' ||
      typeof payload.maxDurationMs !== 'number'
    ) {
      return null;
    }

    return {
      sceneName,
      sentenceId,
      targetSentenceId,
      forwardedLineCount: payload.forwardedLineCount,
      elapsedMs: payload.elapsedMs,
      maxDurationMs: payload.maxDurationMs,
    };
  } catch {
    return null;
  }
}

function translatePreviewCommandToLegacyEnvelope(
  envelope: PreviewCommandRequestEnvelope,
): LegacyDebugEnvelope {
  switch (envelope.type) {
    case 'preview.command.sync-scene':
      return createLegacyDebugEnvelope(LEGACY_DEBUG_COMMAND.JUMP, {
        scene: envelope.payload.sceneName,
        sentence: envelope.payload.sentenceId,
        message: envelope.payload.syncMode === 'fast' ? 'exp' : 'Sync',
      });
    case 'preview.command.run-snippet':
      return createLegacyDebugEnvelope(LEGACY_DEBUG_COMMAND.EXE_COMMAND, {
        scene: 'temp',
        message: envelope.payload.snippet,
      });
    case 'preview.command.run-scene-content':
      return createLegacyDebugEnvelope(LEGACY_DEBUG_COMMAND.TEMP_SCENE, {
        message: envelope.payload.sceneContent,
      });
    case 'preview.command.reload-templates':
      return createLegacyDebugEnvelope(
        LEGACY_DEBUG_COMMAND.REFETCH_TEMPLATE_FILES,
        {
          scene: 'temp',
        },
      );
    case 'preview.command.set-component-visibility':
      return createLegacyDebugEnvelope(
        LEGACY_DEBUG_COMMAND.SET_COMPONENT_VISIBILITY,
        {
          message: JSON.stringify(
            Object.entries(envelope.payload)
              .filter(
                (entry): entry is [string, boolean] =>
                  typeof entry[1] === 'boolean',
              )
              .map(([component, visibility]) => ({
                component,
                visibility,
              })),
          ),
        },
      );
    case 'preview.command.set-font-optimization':
      return createLegacyDebugEnvelope(LEGACY_DEBUG_COMMAND.FONT_OPTIMIZATION, {
        message: envelope.payload.enabled.toString(),
      });
    case 'preview.command.set-effect':
      return createLegacyDebugEnvelope(LEGACY_DEBUG_COMMAND.SET_EFFECT, {
        message: JSON.stringify(envelope.payload),
      });
  }
}

export class EditorPreviewHost {
  public constructor(private readonly options: EditorPreviewHostOptions = {}) {}

  private readonly v1Connections = new Map<WebSocket, V1ConnectionState>();

  private activeEmbeddedPreview: WebSocket | null = null;

  private activeGameId: string | undefined;

  public acceptConnection(
    client: WebSocket,
    request: IncomingMessage,
  ): HostConnectionKind {
    const requestedProtocols = parseRequestedProtocols(request);
    if (requestedProtocols.length === 0) {
      return 'legacy';
    }

    if (!requestedProtocols.includes(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL)) {
      client.close(1002, 'Unsupported WebSocket subprotocol.');
      return 'rejected';
    }

    this.v1Connections.set(client, { role: 'unknown' });
    return 'v1';
  }

  public removeConnection(client: WebSocket) {
    const removedState = this.v1Connections.get(client);
    if (!removedState) {
      return;
    }

    this.v1Connections.delete(client);
    if (this.activeEmbeddedPreview === client) {
      this.activeEmbeddedPreview = null;
    }
  }

  public forwardHostEventToEditors(envelope: ForwardedHostEventEnvelope) {
    for (const [socket, state] of this.v1Connections) {
      if (state.role === 'preview') {
        continue;
      }

      sendEnvelope(socket, envelope);
    }
  }

  public handleMessage(client: WebSocket, rawMessage: string) {
    const connectionState = this.v1Connections.get(client);
    if (!connectionState) {
      return;
    }

    let parsedMessage: unknown;
    try {
      parsedMessage = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (!isProtocolEnvelope(parsedMessage)) {
      return;
    }

    const envelope = parsedMessage;
    if (isRegisterPreviewRequest(envelope)) {
      this.handlePreviewRegistration(client, connectionState, envelope);
      return;
    }

    if (isPreviewCommandRequestEnvelope(envelope)) {
      this.handlePreviewCommandRequest(client, connectionState, envelope);
      return;
    }

    if (envelope.kind === 'event' && isForwardedPreviewEvent(envelope)) {
      this.handlePreviewEvent(client, connectionState, envelope);
    }
  }

  private handlePreviewRegistration(
    client: WebSocket,
    connectionState: V1ConnectionState,
    envelope: RegisterPreviewRequestEnvelope,
  ) {
    const payload = envelope.payload;
    connectionState.role = 'preview';
    connectionState.gameId = payload.gameId;
    connectionState.embeddedLaunchId = payload.embeddedLaunchId;

    if (payload.embeddedLaunchId) {
      this.activeEmbeddedPreview = client;
      this.activeGameId = payload.gameId;
    }

    sendEnvelope(
      client,
      createResponseEnvelope(REGISTER_PREVIEW_TYPE, envelope.requestId, {}),
    );
  }

  private handlePreviewCommandRequest(
    client: WebSocket,
    connectionState: V1ConnectionState,
    envelope: PreviewCommandRequestEnvelope,
  ) {
    connectionState.role = 'editor';

    for (const [previewSocket, previewState] of this.v1Connections) {
      if (!this.isActivePreview(previewSocket, previewState)) {
        continue;
      }

      sendEnvelope(previewSocket, envelope);
    }

    this.options.forwardPreviewCommandToLegacy?.(envelope);

    sendEnvelope(
      client,
      createResponseEnvelope(envelope.type, envelope.requestId, {}),
    );
  }

  private handlePreviewEvent(
    client: WebSocket,
    connectionState: V1ConnectionState,
    envelope: ForwardedHostEventEnvelope,
  ) {
    if (!this.isActivePreview(client, connectionState)) {
      return;
    }

    this.forwardHostEventToEditors(envelope);
  }

  private isActivePreview(
    client: WebSocket,
    connectionState: V1ConnectionState,
  ): boolean {
    if (connectionState.role !== 'preview') {
      return false;
    }

    if (this.activeEmbeddedPreview === client) {
      return true;
    }

    if (!this.activeGameId || !connectionState.gameId) {
      return true;
    }

    return connectionState.gameId === this.activeGameId;
  }
}

export class LegacyEditorPreviewAdapter {
  public constructor(
    private readonly options: LegacyEditorPreviewAdapterOptions = {},
  ) {}

  private readonly connections = new Set<WebSocket>();

  private readonly readyConnections = new Set<WebSocket>();

  public addConnection(client: WebSocket) {
    this.connections.add(client);
  }

  public removeConnection(client: WebSocket) {
    this.connections.delete(client);
    this.readyConnections.delete(client);
  }

  public forwardPreviewCommand(envelope: PreviewCommandRequestEnvelope) {
    const legacyEnvelope = translatePreviewCommandToLegacyEnvelope(envelope);
    const serializedMessage = JSON.stringify(legacyEnvelope);
    for (const socket of this.connections) {
      socket.send(serializedMessage);
    }
  }

  public handleMessage(client: WebSocket, rawMessage: string) {
    let parsedMessage: unknown;
    try {
      parsedMessage = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (!this.isLegacyEnvelope(parsedMessage)) {
      return;
    }

    const serializedMessage = JSON.stringify(parsedMessage);
    for (const socket of this.connections) {
      socket.send(serializedMessage);
    }

    this.forwardLegacyHostEvents(client, parsedMessage);
  }

  private forwardLegacyHostEvents(
    client: WebSocket,
    envelope: LegacyRawEnvelope,
  ) {
    if (!this.isLegacyDebugEnvelope(envelope)) {
      return;
    }

    if (
      envelope.data.command === LEGACY_DEBUG_COMMAND.FAST_PREVIEW_TIMEOUT &&
      this.options.forwardHostEventToV1Editors
    ) {
      const payload = parseLegacyFastPreviewTimeoutPayload(
        envelope.data.message,
      );
      if (!payload) {
        return;
      }

      this.options.forwardHostEventToV1Editors(
        createEventEnvelope('preview.event.fast-preview-timeout', payload),
      );

      return;
    }

    if (
      envelope.data.command !== LEGACY_DEBUG_COMMAND.SYNCFC ||
      !this.options.forwardHostEventToV1Editors
    ) {
      return;
    }

    if (!this.readyConnections.has(client)) {
      this.readyConnections.add(client);
      this.options.forwardHostEventToV1Editors(
        createEventEnvelope('preview.ready.updated', {
          ready: true,
        }),
      );
    }

    const stageState: StageSnapshotUpdatedPayload['stageState'] = isRecord(
      envelope.data.stageSyncMsg,
    )
      ? (envelope.data
          .stageSyncMsg as StageSnapshotUpdatedPayload['stageState'])
      : {};

    this.options.forwardHostEventToV1Editors(
      createEventEnvelope('stage.snapshot.updated', {
        sceneName: envelope.data.sceneMsg.scene,
        sentenceId: envelope.data.sceneMsg.sentence,
        stageState,
      }),
    );
  }

  private isLegacyEnvelope(value: unknown): value is LegacyRawEnvelope {
    return (
      isRecord(value) && typeof value.event === 'string' && 'data' in value
    );
  }

  private isLegacyStageSyncEnvelope(
    value: LegacyRawEnvelope,
  ): value is LegacyDebugEnvelope {
    return (
      isRecord(value.data) &&
      typeof value.data.command === 'number' &&
      isRecord(value.data.sceneMsg) &&
      typeof value.data.sceneMsg.scene === 'string' &&
      typeof value.data.sceneMsg.sentence === 'number' &&
      typeof value.data.message === 'string' &&
      isRecord(value.data.stageSyncMsg)
    );
  }

  private isLegacyDebugEnvelope(
    value: LegacyRawEnvelope,
  ): value is LegacyDebugEnvelope {
    return (
      isRecord(value.data) &&
      typeof value.data.command === 'number' &&
      isRecord(value.data.sceneMsg) &&
      typeof value.data.sceneMsg.scene === 'string' &&
      typeof value.data.sceneMsg.sentence === 'number' &&
      typeof value.data.message === 'string' &&
      isRecord(value.data.stageSyncMsg)
    );
  }
}
