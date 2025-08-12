import mitt, { type Handler } from 'mitt';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WebSocketEvent = {
  'web-socket:on-message': { message: string };
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type IframeEvent = {
  'iframe:refresh-game': null;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EditorEvent = {
  'editor:update-scene': { scene: string };
  'editor:topbar-add-sentence': { sentence: string };
};

type Events = WebSocketEvent & IframeEvent & EditorEvent;

const bus = mitt<Events>();

const handlers = new Map<keyof Events, Set<Handler<Events[keyof Events]>>>();

const all = bus.all;

/** 订阅事件  */
const on = <K extends keyof Events>(type: K, handler: Handler<Events[K]>): void => {
  const handlerSet = handlers.get(type);
  if (!handlerSet) {
    const newHandlerSet = new Set<Handler<Events[keyof Events]>>();
    newHandlerSet.add(handler as Handler<Events[keyof Events]>);
    handlers.set(type, newHandlerSet);
  } else {
    handlerSet.add(handler as Handler<Events[keyof Events]>);
  }
  bus.on(type, handler);
};

/** 发布事件 */
const emit = <K extends keyof Events>(type: K, event: Events[K]): void => {
  bus.emit(type, event);
};

/** 取消订阅事件 */
const off = <K extends keyof Events>(type: K, handler: Handler<Events[K]>): void => {
  const handlerSet = handlers.get(type);
  if (handlerSet) {
    handlerSet.delete(handler as Handler<Events[keyof Events]>);
    if (handlerSet.size === 0) {
      handlers.delete(type);
    }
  }
  bus.off(type, handler);
};

export const eventBus = { all, on, emit, off };
