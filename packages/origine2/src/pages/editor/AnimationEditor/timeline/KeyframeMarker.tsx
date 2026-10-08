import { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import {
  Menu,
  MenuGroup,
  MenuGroupHeader,
  MenuItem,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
} from '@fluentui/react-components';
import { DeleteRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { IKeyPoint } from '../model/animationDocument';
import styles from './timeline.module.scss';

interface IKeyframeMarkerProps {
  point: IKeyPoint;
  left: number;
  isSelected: boolean;
  /** 缓动的值与显示名称 */
  easeLabels: Map<string, string>;
  /** 拖动关键帧的指针事件，由轨道统一处理 */
  dragHandlers: Pick<HTMLAttributes<HTMLDivElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp'>;
  onChange: (patch: Partial<IKeyPoint>) => void;
  onDelete: () => void;
}

/** 悬停多久后显示操作提示（毫秒），避免划过时频繁弹出 */
const TIP_DELAY = 500;

/**
 * 悬停一段时间后才显示的提示。
 * 不用 Tooltip 自带的 showDelay：已有提示显示时，Fluent 会让下一个提示立即出现，
 * 快速划过多个关键帧时提示会一直跟着走，因此由这里自己计时，每个关键帧都重新等待
 */
function useHoverTip() {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number>();

  const hide = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  const showLater = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsVisible(true), TIP_DELAY);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { isVisible, showLater, hide };
}

/**
 * 轨道上的一个关键帧。悬停一会儿后提示可以拖动和右键，右键菜单中设置缓动或删除
 */
export function KeyframeMarker({ point, left, isSelected, easeLabels, dragHandlers, onChange, onDelete }: IKeyframeMarkerProps) {
  const tip = useHoverTip();

  return (
    <Menu openOnContext>
      <MenuTrigger disableButtonEnhancement>
        <Tooltip
          content={
            <>
              {point.time} ms
              <br />
              {t`拖动调整时间，右键设置缓动或删除`}
            </>
          }
          relationship="description"
          positioning="above"
          visible={tip.isVisible}
          // 只接受 Tooltip 的隐藏请求（如按 Esc），显示时机由 useHoverTip 决定
          onVisibleChange={(_, data) => !data.visible && tip.hide()}
        >
          <div
            className={`${styles.keyframe} ${isSelected ? styles.selected : ''}`}
            style={{ left }}
            {...dragHandlers}
            onPointerEnter={tip.showLater}
            onPointerLeave={tip.hide}
            onPointerDown={(event) => {
              // 开始拖动或右键时收起提示，拖动过程中指针一直在关键帧上，不会再弹出
              tip.hide();
              dragHandlers.onPointerDown?.(event);
            }}
          />
        </Tooltip>
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
                onCheckedValueChange={(_, data) => onChange({ ease: data.checkedItems[0] })}
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
          <MenuItem icon={<DeleteRegular />} onClick={onDelete}>{t`删除关键帧`}</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
