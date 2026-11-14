import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { ICharacterCanvas } from '../model/characterDocument';

export interface IViewportState {
  panX: number;
  panY: number;
  zoom: number;
}

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 8;
const FIT_PADDING = 24;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
}

/**
 * 管理画布平移与缩放：首次测量自动居中适配，支持滚轮光标缩放与空格/中键平移
 */
export function useCanvasViewport(
  viewportRef: RefObject<HTMLDivElement>,
  canvasSize: ICharacterCanvas,
  isCanvasInferred: boolean,
) {
  const { width: canvasWidth, height: canvasHeight } = canvasSize;
  const [view, setView] = useState<IViewportState>({ panX: 0, panY: 0, zoom: 0.3 });
  const [spacePressed, setSpacePressed] = useState(false);
  const hasFittedRef = useRef(false);
  const hasUserInteractedRef = useRef(false);

  const fitToViewport = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    hasUserInteractedRef.current = false;
    const availW = Math.max(1, rect.width - FIT_PADDING * 2);
    const availH = Math.max(1, rect.height - FIT_PADDING * 2);
    const zoom = clampZoom(Math.min(availW / canvasWidth, availH / canvasHeight));
    setView({
      zoom,
      panX: (rect.width - canvasWidth * zoom) / 2,
      panY: (rect.height - canvasHeight * zoom) / 2,
    });
  }, [viewportRef, canvasWidth, canvasHeight]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width <= 0 || rect.height <= 0 || hasFittedRef.current) return;
      hasFittedRef.current = true;
      fitToViewport();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportRef, fitToViewport]);

  // 未显式配置 canvas 时，图层首图加载后推导尺寸会从 2560×1440 变化；若用户尚未手动缩放或平移则自动重新适配
  useEffect(() => {
    if (!isCanvasInferred || !hasFittedRef.current || hasUserInteractedRef.current) return;
    fitToViewport();
  }, [isCanvasInferred, canvasWidth, canvasHeight, fitToViewport]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      hasUserInteractedRef.current = true;
      const rect = el.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      const factor = Math.exp(-event.deltaY * 0.0015);
      setView((prev) => {
        const nextZoom = clampZoom(prev.zoom * factor);
        const scale = nextZoom / prev.zoom;
        return {
          zoom: nextZoom,
          panX: cursorX - (cursorX - prev.panX) * scale,
          panY: cursorY - (cursorY - prev.panY) * scale,
        };
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [viewportRef]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isEditableElement(event.target)) setSpacePressed(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') setSpacePressed(false);
    };
    const onBlur = () => setSpacePressed(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      hasUserInteractedRef.current = true;
      const el = viewportRef.current;
      const cx = el ? el.clientWidth / 2 : 0;
      const cy = el ? el.clientHeight / 2 : 0;
      setView((prev) => {
        const nextZoom = clampZoom(prev.zoom * factor);
        const scale = nextZoom / prev.zoom;
        return {
          zoom: nextZoom,
          panX: cx - (cx - prev.panX) * scale,
          panY: cy - (cy - prev.panY) * scale,
        };
      });
    },
    [viewportRef],
  );

  const panBy = useCallback((dx: number, dy: number) => {
    hasUserInteractedRef.current = true;
    setView((prev) => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
  }, []);

  const markInteracted = useCallback(() => {
    hasUserInteractedRef.current = true;
  }, []);

  return { view, spacePressed, fitToViewport, zoomBy, panBy, markInteracted };
}
