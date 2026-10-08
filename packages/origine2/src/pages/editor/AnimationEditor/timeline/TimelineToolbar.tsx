import { CSSProperties } from 'react';
import { Button, Slider, ToggleButton } from '@fluentui/react-components';
import {
  ArrowRepeatAllRegular,
  PauseRegular,
  PlayRegular,
  PreviousRegular,
  ZoomInRegular,
  ZoomOutRegular,
} from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { usePlayback } from './usePlayback';
import { MAX_PX_PER_MS, MIN_PX_PER_MS } from './timelineLayout';
import styles from './timeline.module.scss';

interface ITimelineToolbarProps {
  time: number;
  duration: number;
  playback: ReturnType<typeof usePlayback>;
  onRewind: () => void;
  pxPerMs: number;
  onZoomChange: (pxPerMs: number) => void;
}

/** 点击缩放按钮时的缩放倍数 */
const ZOOM_STEP = 1.5;

/**
 * 播放控制与缩放。缩放滑块按对数刻度，拖动时每一段的变化感受一致
 */
export function TimelineToolbar({ time, duration, playback, onRewind, pxPerMs, onZoomChange }: ITimelineToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Button size="small" appearance="subtle" icon={<PreviousRegular />} title={t`回到开头`} onClick={onRewind} />
      <Button
        size="small"
        appearance="subtle"
        icon={playback.isPlaying ? <PauseRegular /> : <PlayRegular />}
        title={playback.isPlaying ? t`暂停` : t`播放`}
        disabled={duration <= 0}
        onClick={playback.togglePlay}
      />
      <ToggleButton
        size="small"
        appearance="subtle"
        icon={<ArrowRepeatAllRegular />}
        title={t`循环播放`}
        checked={playback.isLoop}
        onClick={() => playback.setIsLoop(!playback.isLoop)}
      />
      <span className={styles.time}>
        {Math.round(time)} / {duration} ms
      </span>
      <div className={styles.zoom} title={t`缩放（Ctrl + 滚轮）`}>
        <Button
          size="small"
          appearance="subtle"
          icon={<ZoomOutRegular />}
          title={t`缩小`}
          onClick={() => onZoomChange(pxPerMs / ZOOM_STEP)}
        />
        <Slider
          className={styles.zoomSlider}
          // 步长很小时 Fluent 画出的刻度线会密到盖住整条轨道，这里去掉刻度线（与 EffectEditor 相同）
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          style={{ '--fui-Slider--steps-percent': '100%' } as CSSProperties}
          size="small"
          min={Math.log2(MIN_PX_PER_MS)}
          max={Math.log2(MAX_PX_PER_MS)}
          step={0.01}
          value={Math.log2(pxPerMs)}
          onChange={(_, data) => onZoomChange(2 ** data.value)}
        />
        <Button
          size="small"
          appearance="subtle"
          icon={<ZoomInRegular />}
          title={t`放大`}
          onClick={() => onZoomChange(pxPerMs * ZOOM_STEP)}
        />
      </div>
    </div>
  );
}
