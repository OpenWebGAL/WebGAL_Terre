import mitt from 'mitt';
import type {
  FastPreviewTimeoutPayload,
  PreviewReadyUpdatedPayload,
  StageSnapshotUpdatedPayload,
} from '@webgal/editor-preview-protocol';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IframeEvents = {
  'iframe:refresh-game': null;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EditorEvents = {
  'editor:update-scene': { scene: string };
  'editor:topbar-add-sentence': { sentence: string };
  'editor:pixi-sync-command': {
    targetPath: string;
    lineNumber: number;
    lineContent: string;
    lineSentence: import('webgal-parser/src/interface/sceneInterface').ISentence | null;
  };
  'editor:drag-update-scene': { targetPath: string; lineNumber: number; newCommand: string };
};

interface EditorPreviewEvents {
  'editor-preview:ready': PreviewReadyUpdatedPayload;
  'editor-preview:stage-snapshot': { snapshot: StageSnapshotUpdatedPayload };
  'editor-preview:fast-preview-timeout': { payload: FastPreviewTimeoutPayload };
}

type Events = Record<PropertyKey, unknown> &
  IframeEvents &
  EditorEvents &
  EditorPreviewEvents;

export const eventBus = mitt<Events>();
