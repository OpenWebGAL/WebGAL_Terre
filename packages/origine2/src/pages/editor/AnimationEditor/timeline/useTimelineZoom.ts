import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clampZoom, DEFAULT_PX_PER_MS, timeToX, xToTime } from './timelineLayout';

const WHEEL_ZOOM_FACTOR = 1.15;

/**
 * 时间轴缩放（每毫秒多少像素）。Ctrl + 滚轮缩放时保持鼠标所指的时刻不动
 * @param containerRef 在此区域内响应 Ctrl + 滚轮
 * @param scrollerRef 横向滚动的轨道区域
 */
export function useTimelineZoom(containerRef: RefObject<HTMLElement>, scrollerRef: RefObject<HTMLElement>) {
  const [pxPerMs, setPxPerMs] = useState(DEFAULT_PX_PER_MS);
  const pxPerMsRef = useRef(pxPerMs);
  pxPerMsRef.current = pxPerMs;
  /** 缩放前鼠标所指的时刻及其在可视区域中的横坐标，缩放后据此调整滚动位置 */
  const anchorRef = useRef<{ time: number; offsetX: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const offsetX = Math.max(0, event.clientX - scroller.getBoundingClientRect().left);
      anchorRef.current = { time: xToTime(scroller.scrollLeft + offsetX, pxPerMsRef.current), offsetX };
      const factor = event.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR;
      setPxPerMs(clampZoom(pxPerMsRef.current * factor));
    };
    // 需要 preventDefault 阻止浏览器缩放页面，因此不能用 passive 监听
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, scrollerRef]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const scroller = scrollerRef.current;
    if (!anchor || !scroller) return;
    scroller.scrollLeft = timeToX(anchor.time, pxPerMs) - anchor.offsetX;
    anchorRef.current = null;
  }, [pxPerMs, scrollerRef]);

  return { pxPerMs, setPxPerMs: (value: number) => setPxPerMs(clampZoom(value)) };
}
