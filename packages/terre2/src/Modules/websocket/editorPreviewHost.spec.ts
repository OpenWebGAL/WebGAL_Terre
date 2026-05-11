import {
  createEventEnvelope,
  createRequestEnvelope,
  createResponseEnvelope,
  EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
} from '@webgal/editor-preview-protocol';
import {
  EditorPreviewHost,
  LegacyEditorPreviewAdapter,
  type HostConnectionKind,
} from './editorPreviewHost';

class MockSocket {
  public readonly sentMessages: string[] = [];

  public readonly closeCalls: Array<{ code?: number; reason?: string }> = [];

  public constructor(public protocol = '') {}

  public send(data: string) {
    this.sentMessages.push(data);
  }

  public close(code?: number, reason?: string | Buffer) {
    this.closeCalls.push({
      code,
      reason: typeof reason === 'string' ? reason : reason?.toString(),
    });
  }
}

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
  SET_TEXT_READ_MODE: 10,
} as const;

function createUpgradeRequest(protocolHeader?: string) {
  return {
    headers: protocolHeader
      ? {
          'sec-websocket-protocol': protocolHeader,
        }
      : {},
  };
}

function connectV1Client(
  host: EditorPreviewHost,
  socket: MockSocket,
): HostConnectionKind {
  return host.acceptConnection(
    socket as never,
    createUpgradeRequest(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL) as never,
  );
}

function registerPreview(
  host: EditorPreviewHost,
  socket: MockSocket,
  payload: {
    gameId?: string;
    embeddedLaunchId?: string;
  },
) {
  host.handleMessage(
    socket as never,
    JSON.stringify(
      createRequestEnvelope(
        'session.register-preview',
        'req-register-preview',
        payload,
      ),
    ),
  );
}

function clearSentMessages(...sockets: MockSocket[]) {
  for (const socket of sockets) {
    socket.sentMessages.length = 0;
  }
}

describe('EditorPreviewHost', () => {
  it('treats bare websocket connections as legacy and rejects unsupported subprotocols', () => {
    const host = new EditorPreviewHost();

    const legacySocket = new MockSocket('');
    const legacyKind = host.acceptConnection(
      legacySocket as never,
      createUpgradeRequest() as never,
    );
    expect(legacyKind).toBe('legacy');

    const v1Socket = new MockSocket(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL);
    const v1Kind = connectV1Client(host, v1Socket);
    expect(v1Kind).toBe('v1');

    const unsupportedSocket = new MockSocket('webgal-editor-preview-sync.v2');
    const unsupportedKind = host.acceptConnection(
      unsupportedSocket as never,
      createUpgradeRequest('webgal-editor-preview-sync.v2') as never,
    );
    expect(unsupportedKind).toBe('rejected');
    expect(unsupportedSocket.closeCalls).toHaveLength(1);
    expect(unsupportedSocket.closeCalls[0]?.code).toBe(1002);
  });

  it('fans out preview commands to all active V1 previews and replies to the editor once', () => {
    const host = new EditorPreviewHost();
    const editorSocket = new MockSocket(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL);
    const embeddedPreviewSocket = new MockSocket(
      EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    );
    const externalPreviewSocket = new MockSocket(
      EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    );

    expect(connectV1Client(host, editorSocket)).toBe('v1');
    expect(connectV1Client(host, embeddedPreviewSocket)).toBe('v1');
    expect(connectV1Client(host, externalPreviewSocket)).toBe('v1');

    registerPreview(host, embeddedPreviewSocket, {
      gameId: 'game-key-1',
      embeddedLaunchId: 'embedded-launch-1',
    });
    registerPreview(host, externalPreviewSocket, {
      gameId: 'game-key-1',
    });
    clearSentMessages(embeddedPreviewSocket, externalPreviewSocket);

    host.handleMessage(
      editorSocket as never,
      JSON.stringify(
        createRequestEnvelope('preview.command.sync-scene', 'req-sync-scene', {
          sceneName: 'scene/start.txt',
          sentenceId: 12,
          syncMode: 'fast',
        }),
      ),
    );

    const expectedForwardedRequest = JSON.stringify(
      createRequestEnvelope('preview.command.sync-scene', 'req-sync-scene', {
        sceneName: 'scene/start.txt',
        sentenceId: 12,
        syncMode: 'fast',
      }),
    );
    expect(embeddedPreviewSocket.sentMessages).toEqual([
      expectedForwardedRequest,
    ]);
    expect(externalPreviewSocket.sentMessages).toEqual([
      expectedForwardedRequest,
    ]);
    expect(editorSocket.sentMessages).toEqual([
      JSON.stringify(
        createResponseEnvelope(
          'preview.command.sync-scene',
          'req-sync-scene',
          {},
        ),
      ),
    ]);
  });

  it('forwards stage snapshots only from previews that still belong to the active game', () => {
    const host = new EditorPreviewHost();
    const editorSocket = new MockSocket(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL);
    const stalePreviewSocket = new MockSocket(
      EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    );
    const embeddedPreviewSocket = new MockSocket(
      EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL,
    );

    connectV1Client(host, editorSocket);
    connectV1Client(host, stalePreviewSocket);
    connectV1Client(host, embeddedPreviewSocket);

    registerPreview(host, stalePreviewSocket, {
      gameId: 'game-key-1',
    });
    registerPreview(host, embeddedPreviewSocket, {
      gameId: 'game-key-2',
      embeddedLaunchId: 'embedded-launch-2',
    });
    clearSentMessages(stalePreviewSocket, embeddedPreviewSocket);

    host.handleMessage(
      stalePreviewSocket as never,
      JSON.stringify(
        createEventEnvelope('stage.snapshot.updated', {
          sceneName: 'scene/old.txt',
          sentenceId: 3,
          stageState: {
            source: 'stale',
          },
        }),
      ),
    );
    expect(editorSocket.sentMessages).toHaveLength(0);

    host.handleMessage(
      embeddedPreviewSocket as never,
      JSON.stringify(
        createEventEnvelope('stage.snapshot.updated', {
          sceneName: 'scene/new.txt',
          sentenceId: 9,
          stageState: {
            source: 'active',
          },
        }),
      ),
    );
    expect(editorSocket.sentMessages).toEqual([
      JSON.stringify(
        createEventEnvelope('stage.snapshot.updated', {
          sceneName: 'scene/new.txt',
          sentenceId: 9,
          stageState: {
            source: 'active',
          },
        }),
      ),
    ]);
  });
});

describe('LegacyEditorPreviewAdapter', () => {
  it('translates V1 preview commands into legacy debug envelopes', () => {
    const adapter = new LegacyEditorPreviewAdapter();
    const legacySocket = new MockSocket('');

    adapter.addConnection(legacySocket as never);

    adapter.forwardPreviewCommand(
      createRequestEnvelope('preview.command.sync-scene', 'req-sync-scene', {
        sceneName: 'start.txt',
        sentenceId: 12,
        syncMode: 'fast',
      }),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope('preview.command.run-snippet', 'req-run-snippet', {
        snippet: 'show bg room;',
      }),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope(
        'preview.command.run-scene-content',
        'req-run-scene-content',
        {
          sceneContent: 'show bg room;',
        },
      ),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope(
        'preview.command.reload-templates',
        'req-reload-templates',
        {},
      ),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope(
        'preview.command.set-component-visibility',
        'req-set-component-visibility',
        {
          showTitle: false,
          showTextBox: true,
        },
      ),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope(
        'preview.command.set-font-optimization',
        'req-set-font-optimization',
        {
          enabled: true,
        },
      ),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope(
        'preview.command.set-text-read-mode',
        'req-set-text-read-mode',
        {
          isRead: true,
        },
      ),
    );
    adapter.forwardPreviewCommand(
      createRequestEnvelope('preview.command.set-effect', 'req-set-effect', {
        target: 'fig-center',
        transform: {
          position: {
            x: 120,
          },
        },
      }),
    );

    expect(legacySocket.sentMessages).toEqual([
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.JUMP,
          sceneMsg: {
            scene: 'start.txt',
            sentence: 12,
          },
          stageSyncMsg: {},
          message: 'exp',
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.EXE_COMMAND,
          sceneMsg: {
            scene: 'temp',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: 'show bg room;',
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.TEMP_SCENE,
          sceneMsg: {
            scene: '',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: 'show bg room;',
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.REFETCH_TEMPLATE_FILES,
          sceneMsg: {
            scene: 'temp',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: '',
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.SET_COMPONENT_VISIBILITY,
          sceneMsg: {
            scene: '',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: JSON.stringify([
            {
              component: 'showTitle',
              visibility: false,
            },
            {
              component: 'showTextBox',
              visibility: true,
            },
          ]),
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.FONT_OPTIMIZATION,
          sceneMsg: {
            scene: '',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: 'true',
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.SET_TEXT_READ_MODE,
          sceneMsg: {
            scene: '',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: JSON.stringify({
            isRead: true,
          }),
        },
      }),
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.SET_EFFECT,
          sceneMsg: {
            scene: '',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: JSON.stringify({
            target: 'fig-center',
            transform: {
              position: {
                x: 120,
              },
            },
          }),
        },
      }),
    ]);
  });

  it('translates legacy stage sync payloads into V1 ready and snapshot events', () => {
    const forwardedEvents: string[] = [];
    const adapter = new LegacyEditorPreviewAdapter({
      forwardHostEventToV1Editors: (envelope) => {
        forwardedEvents.push(JSON.stringify(envelope));
      },
    });
    const legacySocket = new MockSocket('');

    adapter.addConnection(legacySocket as never);
    adapter.handleMessage(
      legacySocket as never,
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.SYNCFC,
          sceneMsg: {
            scene: 'legacy-start.txt',
            sentence: 7,
          },
          stageSyncMsg: {
            effects: [],
            currentSentence: 'legacy',
          },
          message: 'sync',
        },
      }),
    );

    expect(forwardedEvents).toEqual([
      JSON.stringify(
        createEventEnvelope('preview.ready.updated', {
          ready: true,
        }),
      ),
      JSON.stringify(
        createEventEnvelope('stage.snapshot.updated', {
          sceneName: 'legacy-start.txt',
          sentenceId: 7,
          stageState: {
            effects: [],
            currentSentence: 'legacy',
          },
        }),
      ),
    ]);
  });

  it('translates legacy fast preview timeout payloads into V1 timeout events', () => {
    const forwardedEvents: string[] = [];
    const adapter = new LegacyEditorPreviewAdapter({
      forwardHostEventToV1Editors: (envelope) => {
        forwardedEvents.push(JSON.stringify(envelope));
      },
    });
    const legacySocket = new MockSocket('');

    adapter.addConnection(legacySocket as never);
    adapter.handleMessage(
      legacySocket as never,
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.FAST_PREVIEW_TIMEOUT,
          sceneMsg: {
            scene: 'legacy-start.txt',
            sentence: 7,
          },
          stageSyncMsg: {},
          message: JSON.stringify({
            sceneName: 'legacy-start.txt',
            sentenceId: 7,
            targetSentenceId: 15,
            forwardedLineCount: 8,
            elapsedMs: 2200,
            maxDurationMs: 2000,
          }),
        },
      }),
    );

    expect(forwardedEvents).toEqual([
      JSON.stringify(
        createEventEnvelope('preview.event.fast-preview-timeout', {
          sceneName: 'legacy-start.txt',
          sentenceId: 7,
          targetSentenceId: 15,
          forwardedLineCount: 8,
          elapsedMs: 2200,
          maxDurationMs: 2000,
        }),
      ),
    ]);
  });

  it('rebroadcasts legacy message payloads only to legacy clients', () => {
    const adapter = new LegacyEditorPreviewAdapter();
    const firstLegacySocket = new MockSocket('');
    const secondLegacySocket = new MockSocket('');

    adapter.addConnection(firstLegacySocket as never);
    adapter.addConnection(secondLegacySocket as never);

    adapter.handleMessage(
      firstLegacySocket as never,
      JSON.stringify({
        event: 'message',
        data: {
          message: 'legacy-debug-payload',
        },
      }),
    );

    const expectedBroadcast = JSON.stringify({
      event: 'message',
      data: {
        message: 'legacy-debug-payload',
      },
    });
    expect(firstLegacySocket.sentMessages).toEqual([expectedBroadcast]);
    expect(secondLegacySocket.sentMessages).toEqual([expectedBroadcast]);
  });
});

describe('V1 / legacy bridge', () => {
  it('forwards V1 preview commands into the configured legacy adapter bridge', () => {
    const adapter = new LegacyEditorPreviewAdapter();
    const legacySocket = new MockSocket('');
    const host = new EditorPreviewHost({
      forwardPreviewCommandToLegacy: (envelope) => {
        adapter.forwardPreviewCommand(envelope);
      },
    });
    const editorSocket = new MockSocket(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL);

    adapter.addConnection(legacySocket as never);
    connectV1Client(host, editorSocket);

    host.handleMessage(
      editorSocket as never,
      JSON.stringify(
        createRequestEnvelope(
          'preview.command.reload-templates',
          'req-reload-templates',
          {},
        ),
      ),
    );

    expect(legacySocket.sentMessages).toEqual([
      JSON.stringify({
        event: 'message',
        data: {
          command: LEGACY_DEBUG_COMMAND.REFETCH_TEMPLATE_FILES,
          sceneMsg: {
            scene: 'temp',
            sentence: 0,
          },
          stageSyncMsg: {},
          message: '',
        },
      }),
    ]);
    expect(editorSocket.sentMessages).toEqual([
      JSON.stringify(
        createResponseEnvelope(
          'preview.command.reload-templates',
          'req-reload-templates',
          {},
        ),
      ),
    ]);
  });
});
