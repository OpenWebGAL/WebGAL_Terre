import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";


function expandToFourValues(cssValue: string): [number, number, number, number, string] {
  // 正则表达式匹配数值和单位
  const valueUnitPattern = /(-?\d+(?:\.\d+)?)(px|em|%|rem)?/g;
  let match: RegExpExecArray | null;
  let values: number[] = [];
  let unit = "px";

  // 提取所有的值和单位
  while ((match = valueUnitPattern.exec(cssValue)) !== null) {
    values.push(parseFloat(match[1]));
    // 只取第一个匹配到的单位
    if (!unit && match[2]) {
      unit = match[2];
    }
  }

  // 默认单位处理，如果没有有效单位则使用px
  if (!["px", "em", "%", "rem"].includes(unit)) {
    unit = "px";
  }

  console.log(values);
  // 根据不同的值的数量，扩展或复制值
  switch (values.length) {
  case 1:
    // 10px -> 10px 10px 10px 10px
    return [values[0], values[0], values[0], values[0], unit];
  case 2:
    // 10px 20px -> 10px 20px 10px 20px
    return [values[0], values[1], values[0], values[1], unit];
  case 3:
    // 如果是3值输入，按CSS缺省行为，复制第二个值到第四个位置
    return [values[0], values[1], values[2], values[1], unit];
  case 4:
    return [values[0], values[1], values[2], values[3], unit];
  default:
    return [10, 10, 10, 10, 'px'];
  }
}

export default function WGCommonLengthEditor4Values(props: IPropertyEditorProps) {
  // 使用正则表达式来分离数字和单位
  const initialValue = expandToFourValues(props.prop.propValue);
  const [v1,setV1] = useState(initialValue[0].toString());
  const [v2,setV2] = useState(initialValue[1].toString());
  const [v3,setV3] = useState(initialValue[2].toString());
  const [v4,setV4] = useState(initialValue[3].toString());
  const [unit, setUnit] = useState(initialValue[4]);

  const submit = () => {
    // 将宽度和单位拼接为一个字符串，不使用空格分隔
    props.prop.propValue = `${v1}${unit} ${v2}${unit} ${v3}${unit} ${v4}${unit}`;
    props.onSubmit();
  };

  return <div className={s.propertyEditor}>
    <Input
      value={v1}
      onChange={(_, data) => setV1(data.value)}
      style={{marginRight:10,width:70}}
    />
    <Input
      value={v2}
      onChange={(_, data) => setV2(data.value)}
      style={{marginRight:10,width:70}}
    />
    <Input
      value={v3}
      onChange={(_, data) => setV3(data.value)}
      style={{marginRight:10,width:70}}
    />
    <Input
      value={v4}
      onChange={(_, data) => setV4(data.value)}
      style={{marginRight:10,width:70}}
    />
    <Select
      value={unit}
      onChange={(_, data) => setUnit(data.value)}
    >
      <option value="px">{t`像素`}</option>
      <option value="em">{t`文本长度 (em)`}</option>
      <option value="%">{t`%`}</option>
      <option value="rem">{t`根文本长度 (rem)`}</option>
    </Select>
    <Button style={{marginLeft: 8}} onClick={submit}>{t`提交修改`}</Button>
  </div>;
}
