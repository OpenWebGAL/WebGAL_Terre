import { PointerEvent, ReactNode, useRef, useState } from 'react';
import styles from './resizableSplit.module.scss';

interface IResizableSplitProps {
  /** horizontal：左右排列；vertical：上下排列 */
  direction: 'horizontal' | 'vertical';
  /** 用于在 localStorage 中记住分割位置 */
  storageKey: string;
  /** 初次打开时的默认分割比例，默认 0.5 */
  defaultRatio?: number;
  first: ReactNode;
  second: ReactNode;
}

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;

/**
 * 两个区域加一条可拖动的分割线，分割位置按比例记住
 */
export function ResizableSplit({ direction, storageKey, defaultRatio = 0.5, first, second }: IResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => Number(localStorage.getItem(storageKey)) || defaultRatio);
  const [isDragging, setIsDragging] = useState(false);
  const isHorizontal = direction === 'horizontal';

  // 拖动时捕获指针，即使经过预览 iframe 也能持续收到移动事件
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!isDragging || !rect) return;
    const offset = isHorizontal ? (event.clientX - rect.left) / rect.width : (event.clientY - rect.top) / rect.height;
    setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, offset)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    localStorage.setItem(storageKey, ratio.toString());
  };

  return (
    <div ref={containerRef} className={`${styles.split} ${isHorizontal ? styles.horizontal : styles.vertical}`}>
      <div className={styles.pane} style={{ flexBasis: `${ratio * 100}%` }}>{first}</div>
      <div
        className={`${styles.divider} ${isDragging ? styles.dragging : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div className={`${styles.pane} ${styles.rest}`}>{second}</div>
    </div>
  );
}
