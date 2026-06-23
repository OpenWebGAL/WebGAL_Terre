import {
  createRequestEnvelope,
  isKnownPreviewRequestErrorEnvelope,
  isPreviewResponseEnvelope,
  type PreviewQueryType,
  type PreviewRequestError,
  type RequestPayloadByType,
  type ResponsePayloadByType,
} from '@webgal/editor-preview-protocol';

export class PreviewRequestTimeoutError extends Error {
  public constructor(type: string, timeoutMs: number) {
    super(`Preview request "${type}" timed out after ${timeoutMs}ms.`);
    this.name = 'PreviewRequestTimeoutError';
  }
}

export class PreviewRequestTransportError extends Error {
  public constructor(
    type: string,
    public readonly previewError: PreviewRequestError,
  ) {
    super(previewError.message ?? `Preview request "${type}" failed.`);
    this.name = 'PreviewRequestTransportError';
  }
}

interface PendingPreviewRequest {
  type: PreviewQueryType;
  timeout: ReturnType<typeof setTimeout>;
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
}

interface EditorPreviewRequestOwnerOptions {
  createRequestId: () => string;
  send: (envelope: unknown) => boolean;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
}

export class EditorPreviewRequestOwner {
  private readonly pendingRequests = new Map<string, PendingPreviewRequest>();

  private readonly setTimeoutFn: typeof setTimeout;

  private readonly clearTimeoutFn: typeof clearTimeout;

  public constructor(private readonly options: EditorPreviewRequestOwnerOptions) {
    const setTimeoutFn = options.setTimeoutFn ?? globalThis.setTimeout;
    const clearTimeoutFn = options.clearTimeoutFn ?? globalThis.clearTimeout;

    this.setTimeoutFn = ((handler, timeout, ...args) => {
      return setTimeoutFn.call(globalThis, handler, timeout, ...args);
    }) as typeof setTimeout;
    this.clearTimeoutFn = ((timeout) => {
      return clearTimeoutFn.call(globalThis, timeout);
    }) as typeof clearTimeout;
  }

  public sendPreviewRequest<TType extends PreviewQueryType>(
    type: TType,
    payload: RequestPayloadByType[TType],
    timeoutMs: number,
  ): Promise<ResponsePayloadByType[TType]> {
    const requestId = this.options.createRequestId();

    return new Promise((resolve, reject) => {
      const timeout = this.setTimeoutFn(() => {
        this.pendingRequests.delete(requestId);
        reject(new PreviewRequestTimeoutError(type, timeoutMs));
      }, timeoutMs);

      const pendingRequest: PendingPreviewRequest = {
        type,
        timeout,
        resolve: (payload) => {
          resolve(payload as ResponsePayloadByType[TType]);
        },
        reject,
      };
      this.pendingRequests.set(requestId, pendingRequest);

      const sent = this.options.send(createRequestEnvelope(type, requestId, payload));
      if (!sent) {
        this.clearPendingRequest(requestId);
        reject(new Error(`Preview request "${type}" could not be sent.`));
      }
    });
  }

  public handleEnvelope(envelope: unknown): boolean {
    if (isPreviewResponseEnvelope(envelope)) {
      return this.resolveResponse(envelope);
    }

    if (isKnownPreviewRequestErrorEnvelope(envelope)) {
      return this.rejectResponse(envelope);
    }

    return false;
  }

  public rejectAll(error: Error) {
    for (const [requestId, pending] of this.pendingRequests) {
      this.clearTimeoutFn(pending.timeout);
      pending.reject(error);
      this.pendingRequests.delete(requestId);
    }
  }

  public getPendingCount(): number {
    return this.pendingRequests.size;
  }

  private resolveResponse(envelope: ReturnType<typeof createRequestEnvelope> | unknown): boolean {
    if (!isPreviewResponseEnvelope(envelope)) {
      return false;
    }

    const pending = this.pendingRequests.get(envelope.requestId);
    if (!pending || pending.type !== envelope.type) {
      return false;
    }

    this.clearPendingRequest(envelope.requestId);
    pending.resolve(envelope.payload);
    return true;
  }

  private rejectResponse(envelope: unknown): boolean {
    if (!isKnownPreviewRequestErrorEnvelope(envelope)) {
      return false;
    }

    const pending = this.pendingRequests.get(envelope.requestId);
    if (!pending || pending.type !== envelope.type) {
      return false;
    }

    this.clearPendingRequest(envelope.requestId);
    pending.reject(new PreviewRequestTransportError(envelope.type, envelope.error));
    return true;
  }

  private clearPendingRequest(requestId: string): PendingPreviewRequest | undefined {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) {
      return undefined;
    }

    this.clearTimeoutFn(pending.timeout);
    this.pendingRequests.delete(requestId);
    return pending;
  }
}
