import type { PreviewGameMetadata, PreviewTemplateMetadata } from '@webgal/editor-preview-protocol';

export interface IPreviewRuntimeState {
  version: string | null;
  template: PreviewTemplateMetadata | null;
  gameInfo: PreviewGameMetadata | null;
}

export interface IPreviewRuntimeAction {
  updateVersion: (version: IPreviewRuntimeState['version']) => void;
  updateTemplate: (template: IPreviewRuntimeState['template']) => void;
  updateGameInfo: (gameInfo: IPreviewRuntimeState['gameInfo']) => void;
  resetPreviewRuntime: () => void;
}
