import type { IncomingMessage } from 'http';
import { EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL } from '@webgal/editor-preview-protocol';
import { WebSocketGateway } from '@nestjs/websockets';
import type { RawData, WebSocket } from 'ws';
import {
  EditorPreviewHost,
  LegacyEditorPreviewAdapter,
} from './editorPreviewHost';

export function selectEditorPreviewSubprotocol(
  protocols: Set<string>,
): string | false {
  if (protocols.has(EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL)) {
    return EDITOR_PREVIEW_PROTOCOL_V1_SUBPROTOCOL;
  }

  return false;
}

@WebSocketGateway({
  path: '/api/webgalsync',
  transports: 'websocket',
  handleProtocols: (protocols: Set<string>) =>
    selectEditorPreviewSubprotocol(protocols),
})
export class WebGalWebSocketGateway {
  private readonly editorPreviewHost: EditorPreviewHost;

  private readonly legacyAdapter: LegacyEditorPreviewAdapter;

  public constructor() {
    this.legacyAdapter = new LegacyEditorPreviewAdapter({
      forwardHostEventToV1Editors: (envelope) => {
        this.editorPreviewHost.forwardHostEventToEditors(envelope);
      },
    });
    this.editorPreviewHost = new EditorPreviewHost({
      forwardPreviewCommandToLegacy: (envelope) => {
        this.legacyAdapter.forwardPreviewCommand(envelope);
      },
    });
  }

  public handleConnection(client: WebSocket, request: IncomingMessage) {
    const connectionKind = this.editorPreviewHost.acceptConnection(
      client,
      request,
    );
    if (connectionKind === 'legacy') {
      this.legacyAdapter.addConnection(client);
    }

    if (connectionKind === 'rejected') {
      return;
    }

    client.on('message', (rawData: RawData) => {
      const rawMessage = this.normalizeRawMessage(rawData);
      if (connectionKind === 'legacy') {
        this.legacyAdapter.handleMessage(client, rawMessage);
        return;
      }

      this.editorPreviewHost.handleMessage(client, rawMessage);
    });
  }

  public handleDisconnect(client: WebSocket) {
    this.editorPreviewHost.removeConnection(client);
    this.legacyAdapter.removeConnection(client);
  }

  private normalizeRawMessage(rawData: RawData): string {
    if (typeof rawData === 'string') {
      return rawData;
    }

    if (Array.isArray(rawData)) {
      return Buffer.concat(rawData).toString();
    }

    return rawData.toString();
  }
}
