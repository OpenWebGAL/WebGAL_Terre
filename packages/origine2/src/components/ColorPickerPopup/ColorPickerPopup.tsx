import { ColorFormats, TinyColor, tinycolor } from '@ctrl/tinycolor';
import {
  Button,
  Input,
  Popover,
  PopoverSurface,
  PopoverTrigger,
} from '@fluentui/react-components';
import {
  ColorPicker,
  ColorSlider,
  AlphaSlider,
  ColorPickerProps,
  ColorArea,
} from '@fluentui/react-color-picker-preview';
import { t } from '@lingui/macro';

import styles from './colorPickerPopup.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { ArrowSwapFilled, ArrowSwapRegular, bundleIcon } from '@fluentui/react-icons';

const ArrowSwapIcon = bundleIcon(ArrowSwapFilled, ArrowSwapRegular);

export interface ColorPickerPopupProps {
  color: string;
  onChange: (color: string) => void;
}

export const formatMap = new Map<ColorFormats, (color: string | TinyColor) => string>([
  ['hex', (color) => tinycolor(color).a < 1 ? tinycolor(color).toHex8String() : tinycolor(color).toHexString()],
  ['rgb', (color) => tinycolor(color).toRgbString()],
  ['hsl', (color) => tinycolor(color).toHslString()],
  ['hsv', (color) => tinycolor(color).toHsvString()],
]);

export const ColorPickerPopup = ({
  color,
  onChange,
}: ColorPickerPopupProps) => {
  const formats = ['hex', 'rgb', 'hsl', 'hsv'];
  const [format, setFormat] = useState(!tinycolor(color).format.startsWith('hex') || formats.includes(tinycolor(color).format) ? tinycolor(color).format : 'hex');
  const forMater = useMemo(() => formatMap.get(format) ?? formatMap.get('hex')!, [format]);
  const [previewColor, setPreviewColor] = useState(tinycolor(color));
  const [inputColor, setInputColor] = useState(tinycolor(color).toString());

  useEffect(() => {
    if (tinycolor(inputColor).isValid) {
      setPreviewColor(tinycolor(inputColor));
    }
  }, [inputColor]);

  useEffect(() => {
    if (tinycolor(color).isValid) {
      setInputColor(forMater(inputColor));
    }
  },[format]);

  const handleChangeFormat = () => {
    const index = formats.indexOf(format);
    const newFormat = formats[(index + 1) % formats.length] as ColorFormats;
    setFormat(newFormat);
  };

  const handleChange: ColorPickerProps['onColorChange'] = (_, data) => {
    setInputColor(forMater(tinycolor({ ...data.color, a: data.color.a ?? 1 })));
  };

  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <Popover
      open={popoverOpen}
      trapFocus
      onOpenChange={(_, data) => setPopoverOpen(data.open)}
    >
      <PopoverTrigger disableButtonEnhancement>
        <Button style={{ paddingLeft: 0, height: '2rem' }}>
          <div style={{ backgroundColor: tinycolor(color).toRgbString(), height: '2rem', aspectRatio: '1/1' }} />
          <span style={{ marginLeft: '0.5rem', textWrap: 'nowrap' }}>{t`选择颜色`}</span>
        </Button>
      </PopoverTrigger>

      <PopoverSurface>
        <ColorPicker color={previewColor.toHsv()} onColorChange={handleChange}>
          <ColorArea />
          <div className={styles.row}>
            <div className={styles.sliders}>
              <ColorSlider />
              <AlphaSlider />
            </div>
            <div
              className={styles.previewColor}
              style={{
                backgroundColor: tinycolor(previewColor).toRgbString(),
              }}
            />
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '0.5rem' }}>
            <Input
              style={{ flexGrow: 1 }}
              value={inputColor}
              contentAfter={<span>{format}</span>}
              onChange={(_, data) => setInputColor(data.value)}
            />
            <Button icon={<ArrowSwapIcon />} onClick={handleChangeFormat} />
          </div>

        </ColorPicker>
        <div className={styles.actions}>
          <Button
            onClick={() => {
              setPopoverOpen(false);
            }}
          >
            {t`取消`}
          </Button>
          <Button
            appearance='primary'
            onClick={() => {
              onChange(forMater(previewColor));
              setPopoverOpen(false);
            }}
          >
            {t`确定`}
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
};