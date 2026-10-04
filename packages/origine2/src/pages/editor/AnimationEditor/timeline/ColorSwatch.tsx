import { Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components';
import { ColorPicker } from '@fluentui/react';
import { t } from '@lingui/macro';
import { rgbToColor } from '@/pages/editor/GraphicalEditor/utils/rgbToColor';
import { Rgb } from '../model/colorChannels';
import styles from './timeline.module.scss';

interface IColorSwatchProps {
  /** 播放头处的颜色，各通道 0-255 */
  rgb: Rgb;
  onChange: (rgb: Rgb) => void;
}

/**
 * 显示颜色的小色块，点击打开拾色器。拾色器与效果编辑器中的相同
 */
export function ColorSwatch({ rgb, onChange }: IColorSwatchProps) {
  // 关键帧之间的插值可能是小数，拾色器只接受整数
  const [red, green, blue] = rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))));

  return (
    <Popover positioning="below-start" trapFocus>
      <PopoverTrigger disableButtonEnhancement>
        <button
          type="button"
          className={styles.colorSwatch}
          style={{ background: `rgb(${red}, ${green}, ${blue})` }}
          title={t`选择颜色`}
          aria-label={t`选择颜色`}
        />
      </PopoverTrigger>
      <PopoverSurface>
        <ColorPicker
          color={rgbToColor(red, green, blue)}
          alphaType="none"
          onChange={(_, color) => onChange([color.r, color.g, color.b])}
        />
      </PopoverSurface>
    </Popover>
  );
}
