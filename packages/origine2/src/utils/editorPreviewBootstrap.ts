export const WEBGAL_PREVIEW_BOOTSTRAP_REQUEST = 'webgal.preview.bootstrap.request';
export const WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE = 'webgal.preview.bootstrap.provide';

export interface PreviewBootstrapRequest {
  type: typeof WEBGAL_PREVIEW_BOOTSTRAP_REQUEST;
}

export interface PreviewBootstrapProvide {
  type: typeof WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE;
  embeddedLaunchId: string;
}

export function isPreviewBootstrapRequest(value: unknown): value is PreviewBootstrapRequest {
  return typeof value === 'object' && value !== null && (value as PreviewBootstrapRequest).type === WEBGAL_PREVIEW_BOOTSTRAP_REQUEST;
}

export function createPreviewBootstrapProvide(embeddedLaunchId: string): PreviewBootstrapProvide {
  return {
    type: WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE,
    embeddedLaunchId,
  };
}
