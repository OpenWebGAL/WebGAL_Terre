import { Button, Slider, ToggleButton } from '@fluentui/react-components';
import { ArrowRepeatAllRegular, PauseRegular, PlayRegular, PreviousRegular, ZoomInRegular } from '@fluentui/react-icons';
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
        <ZoomInRegular />
        <Slider
          size="small"
          min={Math.log2(MIN_PX_PER_MS)}
          max={Math.log2(MAX_PX_PER_MS)}
          step={0.01}
          value={Math.log2(pxPerMs)}
          onChange={(_, data) => onZoomChange(2 ** data.value)}
        />
      </div>
    </div>
  );
}
