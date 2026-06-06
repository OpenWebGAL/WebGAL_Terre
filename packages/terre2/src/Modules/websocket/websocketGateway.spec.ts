import type { RawData } from 'ws';
import { WebGalWebSocketGateway } from './websocketGateway';

function normalizeRawMessageForTest(
  gateway: WebGalWebSocketGateway,
  rawData: RawData,
) {
  return (
    gateway as unknown as {
      normalizeRawMessage(rawData: RawData): string;
    }
  ).normalizeRawMessage(rawData);
}

describe('WebGalWebSocketGateway', () => {
  it('normalizes ArrayBuffer payloads into the original message string', () => {
    const gateway = new WebGalWebSocketGateway();
    const payload = JSON.stringify({
      kind: 'request',
      type: 'preview.command.reload-templates',
      requestId: 'req-reload-templates',
      payload: {},
    });
    const rawData = Uint8Array.from(Buffer.from(payload)).buffer;

    expect(normalizeRawMessageForTest(gateway, rawData)).toBe(payload);
  });
});
