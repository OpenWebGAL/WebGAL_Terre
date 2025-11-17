import mitt from 'mitt';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WebSocketEvents = {
  'web-socket:on-message': { message: string };
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IframeEvents = {
  'iframe:refresh-game': null;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EditorEvents = {
  'editor:update-scene': { scene: string };
  'editor:topbar-add-sentence': { sentence: string };
  'editor:pixi-sync-command': { targetPath: string; lineNumber: number; lineContent: string };
  'editor:drag-update-scene': { targetPath: string; lineNumber: number; newCommand: string };
};

type Events = WebSocketEvents & IframeEvents & EditorEvents;

export const eventBus = mitt<Events>();
