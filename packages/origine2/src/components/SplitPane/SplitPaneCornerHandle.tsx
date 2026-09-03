import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './splitPaneCornerHandle.module.scss';

interface SplitPaneCornerHandleProps {
  x: number;
  y: number;
  cursor?: 'nwse-resize' | 'nesw-resize';
  onResizeStart?: () => void;
  onResize: (deltaX: number, deltaY: number) => void;
  onResizeEnd?: () => void;
  disablePointerOn?: string;
}

export default function SplitPaneCornerHandle({
  x,
  y,
  cursor = 'nwse-resize',
  onResizeStart,
  onResize,
  onResizeEnd,
  disablePointerOn,
}: SplitPaneCornerHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);
  const onResizeStartRef = useRef(onResizeStart);

  useEffect(() => {
    onResizeRef.current = onResize;
    onResizeEndRef.current = onResizeEnd;
    onResizeStartRef.current = onResizeStart;
  });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    onResizeStartRef.current?.();
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';

    const previousPointerEvents = new Map<HTMLElement, string>();
    if (disablePointerOn) {
      document.querySelectorAll<HTMLElement>(disablePointerOn).forEach((el) => {
        previousPointerEvents.set(el, el.style.pointerEvents);
        el.style.pointerEvents = 'none';
      });
    }

    const handleMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      onResizeRef.current(deltaX, deltaY);
    };

    const handleUp = () => {
      setIsDragging(false);
      onResizeEndRef.current?.();
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('pointercancel', handleUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      previousPointerEvents.forEach((value, el) => {
        el.style.pointerEvents = value;
      });
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointercancel', handleUp);
    };
  }, [isDragging, disablePointerOn]);

  return (
    <div
      className={`${styles.cornerHandle} ${isDragging ? styles.cornerHandleActive : ''}`}
      style={{ left: x, top: y, cursor }}
      onPointerDown={handlePointerDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.cornerHandleDot} />
    </div>
  );
}
