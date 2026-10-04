import { KeyboardEvent, useRef, useState } from 'react';
import { getAnimationDuration, IAnimationDocument, ITrack } from '../model/animationDocument';
import { addTrack, removePoint, updatePoints } from '../model/trackOperations';
import { useAnimationProperties } from '../model/useAnimationProperties';
import { AddPropertyMenu } from './AddPropertyMenu';
import { buildTrackRow } from './buildTrackRow';
import { TimelineRuler } from './TimelineRuler';
import { TimelineToolbar } from './TimelineToolbar';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { TIMELINE_TAIL, timeToX } from './timelineLayout';
import { useElementWidth } from './useElementWidth';
import { usePlayback } from './usePlayback';
import { useTimelineZoom } from './useTimelineZoom';
import styles from './timeline.module.scss';

type Updater<T> = (update: (value: T) => T) => void;

interface IAnimationTimelineProps {
  doc: IAnimationDocument;
  updateTracks: Updater<ITrack[]>;
  updateFields: Updater<Record<string, unknown>>;
  /** 播放头时刻（毫秒） */
  time: number;
  /** 必须是稳定的函数（如 useState 的 setter） */
  onTimeChange: (time: number) => void;
}

/**
 * 类似 AE 的时间轴：每行一个属性，横向为时间，可缩放、拖动播放头和关键帧。
 * 空格播放 / 暂停，Delete 删除选中的关键帧。
 *
 * 只有右下的轨道区域会滚动，刻度尺随它横向滚动，左侧属性栏随它纵向滚动
 */
export function AnimationTimeline({ doc, updateTracks, updateFields, time, onTimeChange }: IAnimationTimelineProps) {
  const { getProperty } = useAnimationProperties();
  const bodyRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const headersRef = useRef<HTMLDivElement>(null);
  const lanesViewportWidth = useElementWidth(lanesRef);
  const { pxPerMs, setPxPerMs } = useTimelineZoom(bodyRef, lanesRef);
  const duration = getAnimationDuration(doc.tracks);
  const playback = usePlayback(duration, time, onTimeChange);
  const [selected, setSelected] = useState<{ path: string; id: string } | null>(null);
  // 轨道至少铺满可视区域，并在动画结尾后留出一段，便于把关键帧往后拖
  const laneWidth = Math.max(timeToX(duration + TIMELINE_TAIL, pxPerMs), lanesViewportWidth);

  const scrub = (newTime: number) => {
    playback.pause();
    onTimeChange(newTime);
  };

  const rows = doc.tracks.map((track) => ({
    path: track.path,
    ...buildTrackRow(track, {
      fields: doc.fields,
      tracks: doc.tracks,
      time,
      pxPerMs,
      laneWidth,
      selected,
      getProperty,
      updateTracks,
      updateFields,
      onSelectPoint: (path, point) => {
        setSelected(point && { path, id: point.id });
        if (point) scrub(point.time);
      },
      onScrub: scrub,
    }),
  }));

  const syncScroll = () => {
    const lanes = lanesRef.current;
    if (!lanes) return;
    if (rulerRef.current) rulerRef.current.scrollLeft = lanes.scrollLeft;
    if (headersRef.current) headersRef.current.scrollTop = lanes.scrollTop;
  };

  // 只在时间轴本身获得焦点时响应，避免与输入框、按钮、菜单的按键冲突
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === ' ') {
      event.preventDefault();
      playback.togglePlay();
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && selected) {
      updateTracks((tracks) => updatePoints(tracks, selected.path, (points) => removePoint(points, selected.id)));
      setSelected(null);
    }
  };

  return (
    <div className={styles.timeline} tabIndex={0} onKeyDown={handleKeyDown}>
      <TimelineToolbar
        time={time}
        duration={duration}
        playback={playback}
        onRewind={() => scrub(0)}
        pxPerMs={pxPerMs}
        onZoomChange={setPxPerMs}
      />
      <div ref={bodyRef} className={styles.body}>
        <div className={styles.corner} />
        <div ref={rulerRef} className={styles.rulerViewport}>
          <TimelineRuler width={laneWidth} pxPerMs={pxPerMs} time={time} onScrub={scrub} />
        </div>
        {/* 属性栏本身不滚动，在这里滚动滚轮时转给轨道区域 */}
        <div
          ref={headersRef}
          className={styles.headers}
          onWheel={(event) => {
            if (!event.ctrlKey && lanesRef.current) lanesRef.current.scrollTop += event.deltaY;
          }}
        >
          {rows.map(({ path, header }) => <TrackHeader key={path} {...header} />)}
          <AddPropertyMenu
            shownPaths={doc.tracks.map((track) => track.path)}
            onAdd={(path) => updateTracks((tracks) => addTrack(tracks, path))}
          />
        </div>
        <div ref={lanesRef} className={styles.lanes} onScroll={syncScroll}>
          <div className={styles.lanesContent} style={{ width: laneWidth }}>
            {rows.map(({ path, lane }) => <TrackLane key={path} {...lane} />)}
            {/* 对应属性栏中“添加属性”那一行，保持两边等高 */}
            <div className={styles.laneSpacer} />
            <div className={styles.playhead} style={{ left: timeToX(time, pxPerMs) }} />
          </div>
        </div>
      </div>
    </div>
  );
}
