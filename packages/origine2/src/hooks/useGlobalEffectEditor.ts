import { useEffect, useRef } from 'react';
import {
  eventBus,
  GlobalEffectEditorEvent,
  GlobalEffectEditorPayload,
} from '@/utils/eventBus';

export function useGlobalEffectEditor(handler: (event: GlobalEffectEditorEvent) => void) {
  const editorId = useRef('');
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const handleEvent = (event: GlobalEffectEditorEvent) => {
      if (event.editorId === editorId.current) handlerRef.current(event);
    };
    eventBus.on('editor:global-effect-editor-event', handleEvent);
    return () => eventBus.off('editor:global-effect-editor-event', handleEvent);
  }, []);

  return (payload: Omit<GlobalEffectEditorPayload, 'editorId'>) => {
    editorId.current = Math.random().toString(36).slice(2);
    eventBus.emit('editor:open-global-effect-editor', { ...payload, editorId: editorId.current });
  };
}
