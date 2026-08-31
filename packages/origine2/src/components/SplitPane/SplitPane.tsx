import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './splitPane.module.scss';

interface SplitPaneProps {
  direction: 'horizontal' | 'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  persistKey?: string;
  /** 是否持久化尺寸（默认 true；仅在提供 persistKey 时生效） */
  persist?: boolean;
  /** 受控模式：由外部控制固定面板尺寸（传入 value 时启用，此时默认忽略 defaultSize/persistKey） */
  value?: number;
  /** 受控模式下拖拽尺寸变化回调 */
  onChange?: (size: number) => void;
  /** 固定尺寸的面板：first（第一个，默认）/ second（第二个） */
  fixedPanel?: 'first' | 'second';
  /** 分隔条拖拽热区尺寸（像素），默认 4 */
  dividerSize?: number;
  /** 分隔条线的颜色，默认使用主题变量 var(--primary) */
  dividerColor?: string;
  /** 拖拽时临时禁用 pointer-events 的元素选择器，用于避免 iframe 吞掉 pointermove */
  disablePointerOn?: string;
  /** 拖拽结束后的回调（显示当前尺寸） */
  onResize?: (size: number) => void;
  children: [React.ReactNode, React.ReactNode];
}

const DEFAULT_DIVIDER_SIZE = 4;

/** 分隔条自定义样式变量（粗细 + 颜色），通过 CSS 变量控制 */
type DividerVars = React.CSSProperties & {
  '--splitpane-divider-size': string;
  '--splitpane-divider-color'?: string;
};

/**
 * 分割面板：拖拽分隔条调整两个面板大小
 */
export default function SplitPane({
  direction,
  defaultSize = 300,
  minSize = 100,
  maxSize = Infinity,
  persistKey,
  persist = true,
  value,
  onChange,
  disablePointerOn,
  onResize,
  fixedPanel = 'first',
  dividerSize = DEFAULT_DIVIDER_SIZE,
  dividerColor,
  children,
}: SplitPaneProps) {
  const isHorizontal = direction === 'horizontal';
  const isControlled = value !== undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(0);
  const didRestoreRef = useRef(false);

  // 实际可用的最大尺寸 = min(用户 maxSize, 容器尺寸 - 分隔条)
  const effectiveMax = Math.max(minSize, Math.min(maxSize, containerSize - dividerSize));

  // 实时监听容器尺寸，用于把面板大小钳制在容器范围内
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

  // 非受控模式：内部维护尺寸 + 可选持久化
  const [size, setSize] = useState(defaultSize);

  // 非受控：首次容器尺寸就绪后，从 localStorage 恢复持久化值，并钳制到有效范围
  useEffect(() => {
    if (isControlled || containerSize === 0 || didRestoreRef.current) return;
    didRestoreRef.current = true;
    let target = defaultSize;
    if (persistKey && persist) {
      // localStorage 在隐私模式/禁用存储时会抛异常，静默降级为默认尺寸
      try {
        const saved = localStorage.getItem(persistKey);
        // 不能用 `parseInt(saved, 10) || defaultSize`：折叠状态（尺寸 0）会被 `0 || ...` 误判为无效值而丢失
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!Number.isNaN(parsed)) target = parsed;
        }
      } catch {
        /* ignore */
      }
    }
    setSize(Math.max(minSize, Math.min(target, effectiveMax)));
  }, [isControlled, containerSize, effectiveMax, minSize, persistKey, persist, defaultSize]);

  // 非受控：容器尺寸后续变化时，只钳制当前值，不重新恢复
  useEffect(() => {
    if (isControlled || !didRestoreRef.current) return;
    setSize((prev) => Math.max(minSize, Math.min(prev, effectiveMax)));
  }, [isControlled, effectiveMax, minSize]);

  // 受控模式：容器尺寸变化时把 value 钳制到有效范围并回写 onChange。
  // 拖拽过程中的钳制由 moveHandler 负责；这里处理窗口缩放等外部变化导致 value 越界的情况。
  // value === 0 表示折叠状态（如调试器收起），不强制钳制到 minSize。
  useEffect(() => {
    if (!isControlled || containerSize === 0 || value === 0) return;
    const clamped = Math.max(minSize, Math.min(value, effectiveMax));
    if (clamped !== value) onChange?.(clamped);
  }, [isControlled, value, containerSize, minSize, effectiveMax, onChange]);

  // 当前生效的尺寸：受控时用 value，非受控时用内部 size
  const currentSize = isControlled ? value : size;
  // 折叠状态：固定面板尺寸为 0 时，隐藏分隔条
  const isCollapsed = currentSize === 0;

  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(currentSize);
  const lastSizeRef = useRef(currentSize);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 只响应主按键（鼠标左键 / 触摸主触点），避免右键/中键按下误触发拖拽
      if (e.button !== 0) return;
      e.preventDefault();
      startPosRef.current = isHorizontal ? e.clientX : e.clientY;
      startSizeRef.current = currentSize;
      setIsDragging(true);
    },
    [isHorizontal, currentSize],
  );

  // 拖拽时：锁定光标、禁止选区、禁用 iframe 指针（防拖拽穿透到 iframe 内容）
  // 使用 Pointer Events（pointermove/pointerup/pointercancel）统一处理鼠标与触摸拖拽
  useEffect(() => {
    if (!isDragging) return;

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
      const pos = isHorizontal ? e.clientX : e.clientY;
      const delta = pos - startPosRef.current;
      // 固定第二个面板时，拖拽方向与尺寸变化相反（分隔条下移 → 第二个面板变小）
      const sizedDelta = fixedPanel === 'second' ? -delta : delta;
      const newSize = Math.min(Math.max(startSizeRef.current + sizedDelta, minSize), effectiveMax);
      lastSizeRef.current = newSize;
      if (isControlled) {
        onChange?.(newSize);
      } else {
        setSize(newSize);
      }
    };
    // 拖拽结束
    const finishDrag = () => {
      setIsDragging(false);
      if (!isControlled && persistKey && persist) {
        try {
          localStorage.setItem(persistKey, lastSizeRef.current.toString());
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
  }, [
    isDragging,
    isHorizontal,
    minSize,
    effectiveMax,
    persistKey,
    persist,
    disablePointerOn,
    isControlled,
    onChange,
    fixedPanel,
  ]);

  // 拖拽结束时通知外部当前尺寸（用于调试/显示当前尺寸）
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    if (wasDraggingRef.current && !isDragging) {
      onResize?.(currentSize);
    }
    wasDraggingRef.current = isDragging;
  }, [isDragging, currentSize, onResize]);

  const fixedStyle = isHorizontal ? { width: `${currentSize}px` } : { height: `${currentSize}px` };
  const isFirstFixed = fixedPanel === 'first';

  // 分隔条自定义样式（粗细 + 颜色）
  const dividerVars: DividerVars = {
    '--splitpane-divider-size': `${dividerSize}px`,
    ...(dividerColor ? { '--splitpane-divider-color': dividerColor } : {}),
  };

  return (
    <div ref={containerRef} className={`${styles.splitPane} ${isHorizontal ? styles.horizontal : styles.vertical}`}>
      <div
        className={`${styles.panel} ${isFirstFixed ? '' : styles.panelFlex}`}
        style={isFirstFixed ? fixedStyle : undefined}
      >
        {children[0]}
      </div>
      {!isCollapsed && (
        <div
          className={`${styles.divider} ${isHorizontal ? styles.dividerX : styles.dividerY} ${
            isDragging ? styles.dividerActive : ''
          }`}
          style={dividerVars}
          onPointerDown={handlePointerDown}
        >
          <div className={styles.dividerLine} />
        </div>
      )}
      <div
        className={`${styles.panel} ${isFirstFixed ? styles.panelFlex : ''}`}
        style={isFirstFixed ? undefined : fixedStyle}
      >
        {children[1]}
      </div>
    </div>
  );
}
