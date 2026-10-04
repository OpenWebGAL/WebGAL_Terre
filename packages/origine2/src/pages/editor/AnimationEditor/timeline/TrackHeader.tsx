import {
  Button,
  Menu,
  MenuGroup,
  MenuDivider,
  MenuGroupHeader,
  MenuItem,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  SpinButton,
} from '@fluentui/react-components';
import { DeleteRegular, DiamondFilled, DiamondRegular, MoreHorizontalRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { IAnimationProperty } from '../model/useAnimationProperties';
import { RELATIVE_CALCS, RelativeCalc } from '../model/animationSettings';
import { formatValue } from './timelineLayout';
import styles from './timeline.module.scss';

export interface ITrackHeaderProps {
  property: IAnimationProperty;
  /** 播放头处的值 */
  value: number;
  /** 播放头处是否有关键帧 */
  hasKeyframe: boolean;
  onValueChange: (value: number) => void;
  onToggleKeyframe: () => void;
  /** 相对动画的计算方式；非相对动画时为 null，不显示该设置 */
  relativeCalc: { override?: RelativeCalc; default: RelativeCalc } | null;
  onRelativeCalcChange: (calc: RelativeCalc | undefined) => void;
  onRemove: () => void;
}

/** 计算方式菜单中表示“使用默认”的值 */
const DEFAULT_CALC = 'default';

/**
 * 时间轴左侧的属性栏：名称、播放头处的值（修改即在此处设置关键帧）、关键帧开关、更多操作
 */
export function TrackHeader(props: ITrackHeaderProps) {
  const { property, value, hasKeyframe, relativeCalc } = props;
  const calcLabels: Record<RelativeCalc, string> = {
    add: t`相加`,
    multiply: t`相乘`,
    multiplyWithZeroFallback: t`相乘（基准为 0 时视为 1）`,
    absolute: t`绝对值`,
  };

  return (
    <div className={styles.header}>
      <span className={styles.trackLabel} title={property.path}>{property.label}</span>
      <SpinButton
        className={styles.valueInput}
        size="small"
        appearance="filled-darker"
        value={value}
        displayValue={formatValue(value, property.precision)}
        step={property.step}
        onChange={(_, data) => {
          const next = data.value ?? parseFloat(data.displayValue ?? '');
          if (Number.isFinite(next)) props.onValueChange(next);
        }}
      />
      <Button
        className={hasKeyframe ? styles.keyframeOn : undefined}
        size="small"
        appearance="transparent"
        icon={hasKeyframe ? <DiamondFilled /> : <DiamondRegular />}
        title={hasKeyframe ? t`删除此处的关键帧` : t`在此处添加关键帧`}
        onClick={props.onToggleKeyframe}
      />
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            className={styles.moreButton}
            size="small"
            appearance="transparent"
            icon={<MoreHorizontalRegular />}
            title={t`更多`}
          />
        </MenuTrigger>
        <MenuPopover>
          <MenuList
            checkedValues={{ calc: [relativeCalc?.override ?? DEFAULT_CALC] }}
            onCheckedValueChange={(_, data) => {
              const calc = data.checkedItems[0];
              props.onRelativeCalcChange(calc === DEFAULT_CALC ? undefined : (calc as RelativeCalc));
            }}
          >
            {relativeCalc && (
              <MenuGroup>
                <MenuGroupHeader>{t`计算方式`}</MenuGroupHeader>
                <MenuItemRadio name="calc" value={DEFAULT_CALC}>
                  {t`默认（${calcLabels[relativeCalc.default]}）`}
                </MenuItemRadio>
                {RELATIVE_CALCS.map((calc) => (
                  <MenuItemRadio key={calc} name="calc" value={calc}>{calcLabels[calc]}</MenuItemRadio>
                ))}
              </MenuGroup>
            )}
            {relativeCalc && <MenuDivider />}
            <MenuItem icon={<DeleteRegular />} onClick={props.onRemove}>{t`移除属性`}</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
