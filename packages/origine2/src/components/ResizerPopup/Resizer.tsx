/* eslint-disable complexity */
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Slider, Text } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownFilled, ArrowDownRegular, ArrowLeftFilled, ArrowLeftRegular, ArrowRightFilled, ArrowRightRegular, ArrowUpFilled, ArrowUpRegular, bundleIcon, DragFilled, DragRegular } from '@fluentui/react-icons';
import styles from './resizer.module.scss';

const DragIcon = bundleIcon(DragFilled, DragRegular);
const ArrowUpIcon = bundleIcon(ArrowUpFilled, ArrowUpRegular);
const ArrowDownIcon = bundleIcon(ArrowDownFilled, ArrowDownRegular);
const ArrowLeftIcon = bundleIcon(ArrowLeftFilled, ArrowLeftRegular);
const ArrowRightIcon = bundleIcon(ArrowRightFilled, ArrowRightRegular);

export interface IOffset {
  x: number;
  y: number;
}

export interface IScale {
  x: number;
  y: number;
}

export interface ResizerProps {
  title: string;
  offset?: IOffset;
  scale?: IScale;
  scaleMin?: number;
  scaleMax?: number;
  scaleLinked?: boolean;
  isCompactButton?: boolean;
  onOffsetChange?: (offset: IOffset) => void;
  onScaleChange?: (scale: IScale) => void;
}

/**
 * 调整偏移和缩放。
 * @param title 按钮标题。
 * @param offset 目标的偏移量。
 * @param scale 目标的缩放。
 * @param scaleMin 最小缩放值。默认为0.1。
 * @param scaleMax 最大缩放值。默认为3。
 * @param scaleLinked 默认为false。开启时，x, y缩放比例相同。
 * @param isCompactButton 默认为 false。开启时可在按钮移动图标上拖动以调整偏移，滚轮以调整缩放。
 * @param onOffsetChange 偏移变化回调。
 * @param onScaleChange 缩放变化回调。
 */
const Resizer = ({
  title,
  offset,
  scale,
  scaleMin = 0.1,
  scaleMax = 3,
  scaleLinked = false,
  isCompactButton = false,
  onOffsetChange,
  onScaleChange,
}: ResizerProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toFixed = (num: number) => {
    return parseFloat(num.toFixed(2));
  };

  const handleOffsetMouseDown = (direction: 'top' | 'bottom' | 'left' | 'right') => {
    if (!onOffsetChange || !offset) return;
    intervalIdRef.current = setInterval(() => {
      if (direction === 'top') {
        onOffsetChange({ x: offset.x, y: offset.y-- });
      } else if (direction === 'bottom') {
        onOffsetChange({ x: offset.x, y: offset.y++ });
      } else if (direction === 'left') {
        onOffsetChange({ x: offset.x--, y: offset.y });
      } else if (direction === 'right') {
        onOffsetChange({ x: offset.x++, y: offset.y });
      }
    }, 100);
  };

  const handleScaleMouseDown = (type: 'x' | 'y' | 'xy', action: 'add' | 'minus') => {
    if (!onScaleChange || !scale) return;

    intervalIdRef.current = setInterval(() => {
      if (type === 'xy') {
        if (action === 'add') {
          onScaleChange({ x: toFixed(scale.x += 0.01), y: toFixed(scale.y += 0.01) });
        } else {
          onScaleChange({ x: toFixed(scale.x -= 0.01), y: toFixed(scale.y -= 0.01) });
        }
      } else {
        if (action === 'add') {
          onScaleChange({ x: type === 'x' ? toFixed(scale.x += 0.01) : scale.x, y: type === 'y' ? toFixed(scale.y += 0.01) : scale.y });
        } else {
          onScaleChange({ x: type === 'x' ? toFixed(scale.x -= 0.01) : scale.x, y: type === 'y' ? toFixed(scale.y -= 0.01) : scale.y });
        }
      }
    }, 100);
  };

  const handleMouseUp = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  const handleUpdateOffsetMouseDown = (
    { event, offset, onChange }: {
      event: React.MouseEvent;
      offset: { x: number; y: number; };
      onChange: (value: { x: number; y: number; }) => void
    }) => {
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    const startX = event.clientX;
    const startY = event.clientY;

    const handleMouseMove = (moveEvent: { clientX: number; clientY: number; }) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      onChange({
        x: offset.x + dx * 4,
        y: offset.y + dy * 4,
      });
    };

    const handleMouseUp = () => {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleScaleWheel = (event: React.WheelEvent, type: 'x' | 'y' | 'xy') => {
    console.log(event.deltaY);
    if (!onScaleChange || !scale) return;
    if (type === 'xy') {
      if (event.deltaY < 0) {
        onScaleChange({ x: toFixed(scale.x += 0.01), y: toFixed(scale.y += 0.01) });
      } else {
        onScaleChange({ x: toFixed(scale.x -= 0.01), y: toFixed(scale.y -= 0.01) });
      }
    } else {
      if (event.deltaY < 0) {
        onScaleChange({ x: type === 'x' ? toFixed(scale.x += 0.01) : scale.x, y: type === 'y' ? toFixed(scale.y += 0.01) : scale.y });
      } else {
        onScaleChange({ x: type === 'x' ? toFixed(scale.x -= 0.01) : scale.x, y: type === 'y' ? toFixed(scale.y -= 0.01) : scale.y });
      }
    }
  };

  return (
    <Popover
      open={popoverOpen}
      trapFocus
      onOpenChange={(_, data) => setPopoverOpen(data.open)}
    >
      <PopoverTrigger disableButtonEnhancement>
        <Button
          style={{ paddingLeft: isCompactButton ? 0 : undefined }}
          icon={
            isCompactButton ?
              <DragIcon
                onMouseDown={(event) => handleUpdateOffsetMouseDown({ event, offset: offset!, onChange: onOffsetChange! })}
                onWheel={(event) => handleScaleWheel(event, 'xy')}
              />
              : undefined
          }>{title}</Button>
      </PopoverTrigger>

      <PopoverSurface className={styles.surface}>
        {
          offset && onOffsetChange &&
          <div className={styles.left}>
            {
              scale && onScaleChange && scaleLinked &&
              <Input
                type="number"
                contentBefore={<Text wrap={false}>{t`缩放` + ':'}</Text>}
                value={scale.x.toString()}
                className={styles.input}
                step={0.01}
                onChange={(_, data) => onScaleChange({ x: Number(data.value), y: Number(data.value) })}
              />
            }
            {
              scale && onScaleChange && !scaleLinked &&
              <Input
                type="number"
                contentBefore={<Text wrap={false}>{t`缩放` + ' X:'}</Text>}
                value={scale.x.toString()}
                className={styles.input}
                step={0.01}
                onChange={(_, data) => onScaleChange({ x: Number(data.value), y: scale.y })}
              />
            }
            {
              scale && onScaleChange && !scaleLinked &&
              <Input
                type="number"
                contentBefore={<Text wrap={false}>{t`缩放` + ' Y:'}</Text>}
                value={scale.y.toString()}
                className={styles.input}
                step={0.01}
                onChange={(_, data) => onScaleChange({ x: scale.x, y: Number(data.value) })}
              />
            }
            <Input
              type="number"
              contentBefore={<Text wrap={false}>{t`变换` + ' X:'}</Text>}
              value={offset.x.toString()}
              className={styles.input}
              onChange={(_, data) => onOffsetChange({ x: Number(data.value), y: offset.y })}
            />
            <Input
              type="number"
              contentBefore={<Text wrap={false}>{t`变换` + ' Y:'}</Text>}
              value={offset.y.toString()}
              className={styles.input}
              onChange={(_, data) => onOffsetChange({ x: offset.x, y: Number(data.value) })}
            />
            <div className={styles.buttons}>
              <div className={styles.offsetGrid}>
                <Button
                  size='small'
                  icon={<ArrowUpIcon />}
                  style={{ gridArea: '1 / 2' }}
                  onClick={() => onOffsetChange({ x: offset.x, y: offset.y - 1 })}
                  onMouseDown={() => handleOffsetMouseDown('top')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
                <Button
                  size='small'
                  icon={<ArrowDownIcon />}
                  style={{ gridArea: '3 / 2' }}
                  onClick={() => onOffsetChange({ x: offset.x, y: offset.y + 1 })}
                  onMouseDown={() => handleOffsetMouseDown('bottom')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
                <Button
                  size='small'
                  icon={<ArrowLeftIcon />}
                  style={{ gridArea: '2 / 1' }}
                  onClick={() => onOffsetChange({ x: offset.x - 1, y: offset.y })}
                  onMouseDown={() => handleOffsetMouseDown('left')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
                <Button
                  size='small'
                  icon={<ArrowRightIcon />}
                  style={{ gridArea: '2 / 3' }}
                  onClick={() => onOffsetChange({ x: offset.x + 1, y: offset.y })}
                  onMouseDown={() => handleOffsetMouseDown('right')}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
                <Button
                  size='small'
                  icon={<DragIcon />}
                  onMouseDown={(event) => handleUpdateOffsetMouseDown({ event, offset, onChange: onOffsetChange })}
                  style={{ gridArea: '2 / 2', cursor: 'move' }}
                />
              </div>
              {
                scale && onScaleChange && scaleLinked &&
                <div className={styles.scaleGrid}>
                  <Button
                    size='small'
                    icon={<ArrowUpIcon />}
                    onClick={() => onScaleChange({ x: toFixed(scale.x + 0.01), y: toFixed(scale.y + 0.01) })}
                    onMouseDown={() => handleScaleMouseDown('xy', 'add')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                  <Button
                    size='small'
                    icon={<ArrowDownIcon />}
                    onClick={() => onScaleChange({ x: toFixed(scale.x - 0.01), y: toFixed(scale.y - 0.01) })}
                    onMouseDown={() => handleScaleMouseDown('xy', 'minus')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              }
              {
                scale && onScaleChange && !scaleLinked &&
                <div className={styles.scaleGrid}>
                  <Button
                    size='small'
                    icon={<ArrowUpIcon />}
                    onClick={() => onScaleChange({ x: toFixed(scale.x + 0.01), y: scale.y })}
                    onMouseDown={() => handleScaleMouseDown('x', 'add')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                  <Button
                    size='small'
                    icon={<ArrowDownIcon />}
                    onClick={() => onScaleChange({ x: toFixed(scale.x - 0.01), y: scale.y })}
                    onMouseDown={() => handleScaleMouseDown('x', 'minus')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              }
              {
                scale && onScaleChange && !scaleLinked &&
                <div className={styles.scaleGrid}>
                  <Button
                    size='small'
                    icon={<ArrowUpIcon />}
                    onClick={() => onScaleChange({ x: scale.x, y: toFixed(scale.y + 0.01) })}
                    onMouseDown={() => handleScaleMouseDown('y', 'add')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                  <Button
                    size='small'
                    icon={<ArrowDownIcon />}
                    onClick={() => onScaleChange({ x: scale.x, y: toFixed(scale.y - 0.01) })}
                    onMouseDown={() => handleScaleMouseDown('y', 'minus')}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              }
            </div>
          </div>
        }
        <div className={styles.right}>
          {
            scale && onScaleChange && scaleLinked &&
            <Slider
              size='small'
              vertical
              min={scaleMin * 100}
              max={scaleMax * 100}
              value={scale.x * 100}
              style={{ minWidth: '20px', minHeight: '100%' }}
              onChange={(_, data) => onScaleChange({ x: data.value / 100, y: data.value / 100 })}
              onWheel={(event) => handleScaleWheel(event, 'xy')}
            />
          }
          {
            scale && onScaleChange && !scaleLinked &&
            <Slider
              size='small'
              vertical
              min={scaleMin * 100}
              max={scaleMax * 100}
              value={scale.x * 100}
              style={{ minWidth: '20px', minHeight: '100%' }}
              onChange={(_, data) => onScaleChange({ x: data.value / 100, y: scale.y })}
              onWheel={(event) => handleScaleWheel(event, 'x')}
            />
          }
          {
            scale && onScaleChange && !scaleLinked &&
            <Slider
              size='small'
              vertical
              min={scaleMin * 100}
              max={scaleMax * 100}
              value={scale.y * 100}
              style={{ minWidth: '20px', minHeight: '100%' }}
              onChange={(_, data) => onScaleChange({ x: scale.x, y: data.value / 100 })}
              onWheel={(event) => handleScaleWheel(event, 'y')}
            />
          }
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default Resizer; 