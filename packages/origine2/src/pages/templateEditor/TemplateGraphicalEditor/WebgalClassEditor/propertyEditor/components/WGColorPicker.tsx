import {ColorPicker} from "@fluentui/react";

export default function WGColorPicker(props: { color: string, onChange: (hexColor: string) => void }) {
  const hexColor = toHex(props.color);
  return <ColorPicker color={convertColor(hexColor)} onChange={(_, data) => {
    const hexColor = data.hex;
    const hexAlpha = Math.floor(data.a ?? 0).toString(16).padStart(2, '0');
    const hex = `#${hexColor}${hexAlpha}`.toUpperCase();
    props.onChange(hex);
  }}/>;
}

export function convertColor(hex: string) {
  if (hex.length !== 9) {
    throw new Error("Invalid hex color format. Expected #XXXXXXXX.");
  }
  // 从字符串中提取红色、绿色、蓝色和透明度的十六进制值
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  let a = parseInt(hex.slice(7, 9), 16) / 100;  // 转换透明度到0-1范围
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function toHex(rawValue: string): string {
  // 处理特殊值 "transparent"
  if (rawValue === 'transparent') {
    return '#00000000';
  }

  // 删除所有空格并转换为小写，方便处理
  const value = rawValue.replace(/\s/g, '').toLowerCase();

  // 处理形式为 #RGB 的十六进制值
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return ('#' + value[1].repeat(2) + value[2].repeat(2) + value[3].repeat(2) + 'ff').toUpperCase();
  }

  // 处理形式为 #RRGGBB 的十六进制值
  if (/^#[0-9a-f]{6}$/.test(value)) {
    return (value + 'ff').toUpperCase();
  }

  // 处理形式为 #RRGGBBAA 的十六进制值
  if (/^#[0-9a-f]{8}$/.test(value)) {
    return value.toUpperCase();
  }

  // 处理形式为 rgb(r, g, b) 或 rgba(r, g, b, a)
  if (/^rgba?\(/.test(value)) {
    // 使用更复杂的正则表达式以匹配包括小数在内的数字
    const numbers = value.match(/[\d\.]+/g)?.map(num => parseFloat(num));
    if (!numbers || (numbers.length !== 3 && numbers.length !== 4)) {
      return '#00000000'; // 默认纯黑色
    }
    const [r, g, b, a = 1] = numbers; // 默认 alpha 为 1
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase(); // 转换 alpha 到 00-FF
    const rgbHex = [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase(); // 转换 RGB 到十六进制
    return `#${rgbHex}${alphaHex}`;
  }

  // 如果没有匹配到任何已知格式，返回纯黑色
  return '#000000FF';
};
