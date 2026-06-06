import mitt from 'mitt';
import type { ReactNode } from 'react';
import type {
  FastPreviewTimeoutPayload,
  PreviewReadyUpdatedPayload,
  StageSnapshotUpdatedPayload,
} from '@webgal/editor-preview-protocol';
import type { ISentence } from 'webgal-parser/src/interface/sceneInterface';

export type EffectEditorOptionKey =
  | 'enterAnimation'
  | 'exitAnimation'
  | 'duration'
  | 'enterDuration'
  | 'exitDuration'
  | 'ease'
  | 'blendMode';

export interface GlobalEffectEditorPayload {
  editorId: string;
  title: string;
  json: string;
  sentence: ISentence;
  index: number;
  targetPath: string;
  tip?: string;
  options?: Partial<Record<EffectEditorOptionKey, string | number>>;
}

export type GlobalEffectEditorEvent =
  | { editorId: string; action: 'change'; value: string }
  | { editorId: string; action: 'preview'; value: any }
  | {
    editorId: string;
    action: 'option';
    key: EffectEditorOptionKey;
    value: string | number;
    submit?: boolean;
  };

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IframeEvents = {
  'iframe:refresh-game': null;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EditorEvents = {
  'editor:update-scene': { scene: string };
  'editor:topbar-add-sentence': { sentence: string };
  'editor:open-global-terre-panel': {
    title: string;
    children: ReactNode;
    bottomBarChildren?: ReactNode;
    width?: number;
  };
  'editor:open-global-effect-editor': GlobalEffectEditorPayload;
  'editor:global-effect-editor-event': GlobalEffectEditorEvent;
  'editor:pixi-sync-command': {
    targetPath: string;
    lineNumber: number;
    lineContent: string;
    lineSentence: ISentence | null;
  };
  'editor:sync-current-line': null;
  'editor:drag-update-scene': { targetPath: string; lineNumber: number; newCommand: string };
  'editor:sync-dragger': { x: number; y: number; scaleX: number; scaleY: number; rotation: number };
};

interface EditorPreviewEvents {
  'editor-preview:ready': PreviewReadyUpdatedPayload;
  'editor-preview:stage-snapshot': { snapshot: StageSnapshotUpdatedPayload };
  'editor-preview:fast-preview-timeout': { payload: FastPreviewTimeoutPayload };
}

type Events = Record<PropertyKey, unknown> & IframeEvents & EditorEvents & EditorPreviewEvents;

export const eventBus = mitt<Events>();
