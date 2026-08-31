import React, { useEffect, useRef, useState } from 'react';
import styles from './multiSplitPane.module.scss';

interface MultiSplitPaneProps {
  direction: 'horizontal' | 'vertical';
  /** 各段尺寸：固定段为像素数值，最后一段必须是 'flex'（自动填充剩余空间） */
  sizes: Array<number | 'flex'>;
  /** 每段的最小尺寸（像素），默认 0 */
  minSizes?: number[];
  /** 受控回调：拖拽后返回各固定段的尺寸（不含 flex 段） */
  onSizesChange?: (sizes: number[]) => void;
  /** 分隔条拖拽热区尺寸（像素），默认 4 */
  dividerSize?: number;
  /** 分隔条线的颜色，默认使用主题变量 var(--primary) */
  dividerColor?: string;
  /** 拖拽时临时禁用 pointer-events 的元素选择器，用于避免 iframe 吞掉 pointermove */
  disablePointerOn?: string;
  /** 尺寸持久化的 localStorage key；提供后拖拽结果会被记住，下次挂载自动恢复（受控模式同样生效） */
  persistKey?: string;
  /** 是否持久化尺寸（默认 true；仅在提供 persistKey 时生效） */
  persist?: boolean;
  children: React.ReactNode[];
}

const DEFAULT_DIVIDER_SIZE = 4;

interface PanelMaxParams {
  index: number;
  fixed: number[];
  containerSize: number;
  dividerCount: number;
  dividerSize: number;
}

/** 计算某个固定段可调整到的最大尺寸：容器尺寸 - 其他固定段之和 - 分隔条总宽（保证 flex 段 ≥ 0） */
const computePanelMax = ({ index, fixed, containerSize, dividerCount, dividerSize }: PanelMaxParams): number => {
  if (containerSize <= 0) return Infinity;
  const otherSum = fixed.reduce((acc, s, i) => (i === index ? acc : acc + s), 0);
  return containerSize - otherSum - dividerCount * dividerSize;
};

interface ClampParams {
  sizes: number[];
  containerSize: number;
  minSizes: number[];
  dividerCount: number;
  dividerSize: number;
}

/** 把固定段列表钳制到容器内：总宽超出时从最后一个固定段开始往回缩小（各段不低于 min） */
const clampToContainer = ({ sizes, containerSize, minSizes, dividerCount, dividerSize }: ClampParams): number[] => {
  const totalDividers = dividerCount * dividerSize;
  const totalFixed = sizes.reduce((acc, s) => acc + s, 0);
  if (totalFixed + totalDividers <= containerSize) return sizes;
  const next = [...sizes];
  let overflow = totalFixed + totalDividers - containerSize;
  for (let i = next.length - 1; i >= 0 && overflow > 0; i--) {
    const min = minSizes[i] ?? 0;
    const shrink = Math.min(next[i] - min, overflow);
    if (shrink > 0) {
      next[i] -= shrink;
      overflow -= shrink;
    }
  }
  return next;
};

/** 分隔条自定义样式变量（粗细 + 颜色），通过 CSS 变量控制 */
type MultiSplitPaneDividerVars = React.CSSProperties & {
  '--msp-divider-size': string;
  '--msp-divider-color'?: string;
};

/**
 * 多段分割面板：拖拽分隔条调整各段尺寸
 */
export default function MultiSplitPane({
  direction,
  sizes,
  minSizes = [],
  onSizesChange,
  persistKey,
  persist = true,
  dividerSize = DEFAULT_DIVIDER_SIZE,
  dividerColor,
  disablePointerOn,
  children,
}: MultiSplitPaneProps) {
  const isHorizontal = direction === 'horizontal';
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(0);
  const [activeDividerIndex, setActiveDividerIndex] = useState<number | null>(null);

  // 记录拖拽起始信息
  const dragInfoRef = useRef<{
    index: number; // 被拖拽分隔条对应的固定段索引
    startPos: number;
    startSize: number;
  } | null>(null);

  // 实时监听容器尺寸
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const size = isHorizontal ? el.clientWidth : el.clientHeight;
      setContainerSize(size);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHorizontal]);

  // 从 sizes 提取固定段的当前值
  const fixedSizes = sizes.filter((s): s is number => s !== 'flex');

  const dividerCount = children.length - 1;

  // 用 ref 保存拖拽期间需要读取的最新值，避免 effect 因这些值每次渲染都是新引用而反复重挂监听
  const fixedSizesRef = useRef(fixedSizes);
  fixedSizesRef.current = fixedSizes;
  const minSizesRef = useRef(minSizes);
  minSizesRef.current = minSizes;
  const containerSizeRef = useRef(containerSize);
  containerSizeRef.current = containerSize;
  const onSizesChangeRef = useRef(onSizesChange);
  onSizesChangeRef.current = onSizesChange;
  // 记录已回写的“容器尺寸 + sizes”组合，避免父组件未应用钳制值时造成无限循环
  const lastClampedKeyRef = useRef('');
  // 最近一次通知出去的固定段尺寸（拖拽结束 / 钳制时用于落盘持久化）
  const lastSizesRef = useRef(fixedSizes);
  // 已恢复持久化的 key：persistKey 变化（如切换模板）时重新恢复一次
  const restoredKeyRef = useRef<string | null>(null);

  const handleDividerPointerDown = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    // 只响应主按键（鼠标左键 / 触摸主触点），避免右键/中键按下误触发拖拽
    if (e.button !== 0) return;
    e.preventDefault();
    const pos = isHorizontal ? e.clientX : e.clientY;
    dragInfoRef.current = {
      index,
      startPos: pos,
      startSize: fixedSizes[index] ?? 0,
    };
    setActiveDividerIndex(index);
  };

  // 拖拽时：锁定光标、禁止选区、禁用 iframe 指针
  // 使用 Pointer Events（pointermove/pointerup/pointercancel）统一处理鼠标与触摸拖拽
  useEffect(() => {
    if (activeDividerIndex === null || !dragInfoRef.current) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    // 用元素引用保存原始值，避免用 id/className 作 key 时多个元素互相覆盖
    const previousPointerEvents = new Map<HTMLElement, string>();
    if (disablePointerOn) {
      document.querySelectorAll<HTMLElement>(disablePointerOn).forEach((el) => {
        previousPointerEvents.set(el, el.style.pointerEvents);
        el.style.pointerEvents = 'none';
      });
    }

    const moveHandler = (e: PointerEvent) => {
      const info = dragInfoRef.current;
      if (!info) return;
      const pos = isHorizontal ? e.clientX : e.clientY;
      const delta = pos - info.startPos;
      const fixed = fixedSizesRef.current;
      const min = minSizesRef.current[info.index] ?? 0;
      // 上限 = 容器 - 其他固定段 - 分隔条总宽，保证最后一个 flex 段至少为 0
      const max = computePanelMax({
        index: info.index,
        fixed,
        containerSize: containerSizeRef.current,
        dividerCount,
        dividerSize,
      });
      const newSize = Math.min(Math.max(min, info.startSize + delta), Math.max(min, max));
      // 更新对应的固定段尺寸
      const next = fixed.map((s, i) => (i === info.index ? newSize : s));
      lastSizesRef.current = next;
      onSizesChangeRef.current?.(next);
    };

    const finishDrag = () => {
      setActiveDividerIndex(null);
      dragInfoRef.current = null;
      if (persistKey && persist) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(lastSizesRef.current));
        } catch {
          /* ignore */
        }
      }
    };

    document.addEventListener('pointermove', moveHandler);
    document.addEventListener('pointerup', finishDrag);
    document.addEventListener('pointercancel', finishDrag);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      if (disablePointerOn) {
        previousPointerEvents.forEach((value, el) => {
          el.style.pointerEvents = value;
        });
      }
      document.removeEventListener('pointermove', moveHandler);
      document.removeEventListener('pointerup', finishDrag);
      document.removeEventListener('pointercancel', finishDrag);
    };
  }, [activeDividerIndex, isHorizontal, disablePointerOn, dividerCount, dividerSize, persistKey, persist]);

  // 持久化恢复 + 容器钳制：
  // 1) 每个 persistKey 首次容器量到后，从 localStorage 恢复尺寸并回写（受控模式同样生效）；
  // 2) 任何时刻若固定段总和超出容器（如窗口缩放），从最后一个固定段开始往回缩小并回写，结果同样落盘。
  useEffect(() => {
    if (containerSize <= 0 || !onSizesChange) return;

    let base = fixedSizes;
    if (persistKey && persist && restoredKeyRef.current !== persistKey) {
      restoredKeyRef.current = persistKey;
      let saved: number[] | null = null;
      try {
        const raw = localStorage.getItem(persistKey);
        if (raw !== null) {
          const parsed = JSON.parse(raw) as unknown;
          if (
            Array.isArray(parsed) &&
            parsed.length === fixedSizes.length &&
            parsed.every((n) => typeof n === 'number' && !Number.isNaN(n))
          ) {
            saved = parsed;
          }
        }
      } catch {
        /* ignore */
      }
      if (saved) base = clampToContainer({ sizes: saved, containerSize, minSizes, dividerCount, dividerSize });
    }

    const next = clampToContainer({ sizes: base, containerSize, minSizes, dividerCount, dividerSize });
    if (!next.some((s, i) => s !== fixedSizes[i])) return;
    // 父组件未应用钳制值时避免重复回写（sizes 未变则 key 不变）
    const key = `${containerSize}|${minSizes.join(',')}|${fixedSizes.join(',')}`;
    if (lastClampedKeyRef.current === key) return;
    lastClampedKeyRef.current = key;
    lastSizesRef.current = next;
    onSizesChange(next);
    if (persistKey && persist) {
      try {
        localStorage.setItem(persistKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, [containerSize, fixedSizes, minSizes, dividerCount, dividerSize, persistKey, persist, onSizesChange]);

  const dividerVars: MultiSplitPaneDividerVars = {
    '--msp-divider-size': `${dividerSize}px`,
    ...(dividerColor ? { '--msp-divider-color': dividerColor } : {}),
  };

  // 渲染各段 + 分隔条
  const content = [];
  for (let i = 0; i < children.length; i++) {
    // 判断该段是否固定尺寸（最后一个或显式 flex）
    const isFlex = sizes[i] === 'flex' || i === children.length - 1;
    const fixedSize = typeof sizes[i] === 'number' ? (sizes[i] as number) : undefined;
    const panelStyle = isFlex ? undefined : isHorizontal ? { width: `${fixedSize}px` } : { height: `${fixedSize}px` };

    content.push(
      <div key={`panel-${i}`} className={`${styles.panel} ${isFlex ? styles.panelFlex : ''}`} style={panelStyle}>
        {children[i]}
      </div>,
    );

    // 段之间插入分隔条
    if (i < dividerCount) {
      content.push(
        <div
          key={`divider-${i}`}
          className={`${styles.divider} ${isHorizontal ? styles.dividerX : styles.dividerY} ${
            activeDividerIndex === i ? styles.dividerActive : ''
          }`}
          style={dividerVars}
          onPointerDown={handleDividerPointerDown(i)}
        >
          <div className={styles.dividerLine} />
        </div>,
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.multiSplitPane} ${isHorizontal ? styles.horizontal : styles.vertical}`}
    >
      {content}
    </div>
  );
}
