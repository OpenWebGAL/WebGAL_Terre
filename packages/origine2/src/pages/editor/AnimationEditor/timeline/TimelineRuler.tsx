import { PointerEvent } from 'react';
import { snapTime, timeToX, xToTime } from './timelineLayout';
import styles from './timeline.module.scss';

interface ITimelineRulerProps {
  width: number;
  pxPerMs: number;
  time: number;
  onScrub: (time: number) => void;
}

/** 刻度间隔的候选值（毫秒），按缩放选择使刻度不至于太密的最小一个 */
const TICK_STEPS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000, 60000];
const MIN_TICK_SPACING = 64;

/**
 * 时间刻度尺，按住拖动即可移动播放头
 */
export function TimelineRuler({ width, pxPerMs, time, onScrub }: ITimelineRulerProps) {
  const step = TICK_STEPS.find((candidate) => candidate * pxPerMs >= MIN_TICK_SPACING) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const ticks = Array.from({ length: Math.floor(xToTime(width, pxPerMs) / step) + 1 }, (_, index) => index * step);

  const scrubTo = (event: PointerEvent<HTMLDivElement>) => {
    const x = event.clientX - event.currentTarget.getBoundingClientRect().left;
    onScrub(snapTime(xToTime(x, pxPerMs)));
  };

  return (
    <div
      className={styles.ruler}
      style={{ width }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        scrubTo(event);
      }}
      onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && scrubTo(event)}
    >
      {ticks.map((tick) => (
        <div key={tick} className={styles.tick} style={{ left: timeToX(tick, pxPerMs) }}>
          <span className={styles.tickLabel}>{tick}</span>
        </div>
      ))}
      <div className={styles.playheadHandle} style={{ left: timeToX(time, pxPerMs) }} />
    </div>
  );
}
