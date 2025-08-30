import { IColor } from '@fluentui/react';

/**
 * 将RGB数值（0-255）转换为ColorPicker所需的IColor类型
 * @param redColor R通道值（0-255）
 * @param greenColor G通道值（0-255）
 * @param blueColor B通道值（0-255）
 * @returns IColor对象（包含RGBA、HSV、十六进制等格式）
 */
export const rgbToColor = (redColor?: number, greenColor?: number, blueColor?: number): IColor => {
  const red = redColor ?? 255; // 若参数是 undefined 则取 255
  const green = greenColor ?? 255;
  const blue = blueColor ?? 255;
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const cmax = Math.max(r, g, b);
  const cmin = Math.min(r, g, b);
  let delta = cmax - cmin;

  let h = 0;
  if (delta !== 0) {
    if (cmax === r) h = ((g - b) / delta) * 60;
    else if (cmax === g) h = ((b - r) / delta) * 60 + 120;
    else h = ((r - g) / delta) * 60 + 240;
    if (h < 0) h += 360;
  }

  let s = cmax === 0 ? 0 : (delta / cmax) * 100.0;
  let v = cmax * 100.0;

  return {
    r: red,
    g: green,
    b: blue,
    a: 100,
    h,
    s,
    v,
    hex: red.toString(16).padStart(2, '0') + green.toString(16).padStart(2, '0') + blue.toString(16).padStart(2, '0'),
    str: `rgba(${red}, ${green}, ${blue}, 100)`,
  };
};
