import { PointerEvent, useRef } from 'react';
import {
  Menu,
  MenuGroup,
  MenuGroupHeader,
  MenuItem,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { useEaseTypeOptions } from '@/hooks/useEaseTypeOptions';
import { IKeyPoint } from '../model/animationDocument';
import { snapTime, timeToX, xToTime } from './timelineLayout';
import styles from './timeline.module.scss';

export interface ITrackLaneProps {
  points: IKeyPoint[];
  pxPerMs: number;
  width: number;
  selectedId: string | undefined;
  /** 选中关键帧，点击空白处时为 null */
  onSelectPoint: (point: IKeyPoint | null) => void;
  onPointChange: (id: string, patch: Partial<IKeyPoint>) => void;
  onDeletePoint: (id: string) => void;
  /** 点击轨道空白处、拖动关键帧时移动播放头 */
  onScrub: (time: number) => void;
}

/**
 * 一个属性的关键帧轨道：拖动关键帧调整时间，右键设置缓动或删除
 */
export function TrackLane(props: ITrackLaneProps) {
  const { points, pxPerMs, width, selectedId } = props;
  // useEaseTypeOptions 中的空值表示“默认”，v2 中缺省即为 easeInOut，这里直接显示实际的缓动
  const easeLabels = new Map([...useEaseTypeOptions()].filter(([value]) => value !== ''));
  const dragRef = useRef<{ id: string; startX: number; startTime: number } | null>(null);
  const first = points[0];
  const last = points[points.length - 1];

  const handleKeyframePointerDown = (event: PointerEvent<HTMLDivElement>, point: IKeyPoint) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: point.id, startX: event.clientX, startTime: point.time };
    props.onSelectPoint(point);
  };

  const handleKeyframePointerMove = (event: PointerEvent<HTMLDivElement>, point: IKeyPoint) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== point.id) return;
    const time = snapTime(drag.startTime + (event.clientX - drag.startX) / pxPerMs);
    if (time !== point.time) {
      props.onPointChange(point.id, { time });
      props.onScrub(time);
    }
  };

  return (
    <div
      className={styles.lane}
      style={{ width }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        props.onSelectPoint(null);
        props.onScrub(snapTime(xToTime(event.clientX - event.currentTarget.getBoundingClientRect().left, pxPerMs)));
      }}
    >
      {points.length > 1 && (
        <div
          className={styles.span}
          style={{ left: timeToX(first.time, pxPerMs), width: (last.time - first.time) * pxPerMs }}
        />
      )}
      {points.map((point) => (
        <Menu key={point.id} openOnContext>
          <MenuTrigger disableButtonEnhancement>
            <div
              className={`${styles.keyframe} ${point.id === selectedId ? styles.selected : ''}`}
              style={{ left: timeToX(point.time, pxPerMs) }}
              title={`${point.time} ms`}
              onPointerDown={(event) => handleKeyframePointerDown(event, point)}
              onPointerMove={(event) => handleKeyframePointerMove(event, point)}
              onPointerUp={() => {
                dragRef.current = null;
              }}
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <MenuItem secondaryContent={easeLabels.get(point.ease) ?? point.ease}>{t`缓动`}</MenuItem>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList
                    checkedValues={{ ease: [point.ease] }}
                    onCheckedValueChange={(_, data) => props.onPointChange(point.id, { ease: data.checkedItems[0] })}
                  >
                    <MenuGroup>
                      <MenuGroupHeader>{t`从上一关键帧到此帧`}</MenuGroupHeader>
                      {[...easeLabels].map(([value, label]) => (
                        <MenuItemRadio key={value} name="ease" value={value}>{label}</MenuItemRadio>
                      ))}
                    </MenuGroup>
                  </MenuList>
                </MenuPopover>
              </Menu>
              <MenuItem icon={<DeleteRegular />} onClick={() => props.onDeletePoint(point.id)}>{t`删除关键帧`}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      ))}
    </div>
  );
}
