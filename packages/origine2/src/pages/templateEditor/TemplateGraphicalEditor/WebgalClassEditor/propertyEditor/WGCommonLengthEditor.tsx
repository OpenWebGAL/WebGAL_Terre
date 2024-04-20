import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";

export default function WGCommonLengthEditor(props: IPropertyEditorProps) {
  // 使用正则表达式来分离数字和单位
  const initialValue = props.prop.propValue.match(/(\d+)(\D+)/) || ['','100','px']; // 默认为100px
  const [width, setWidth] = useState(initialValue[1]);
  const [unit, setUnit] = useState(initialValue[2]);

  const submit = () => {
    // 将宽度和单位拼接为一个字符串，不使用空格分隔
    props.prop.propValue = `${width}${unit}`;
    props.onSubmit();
  };

  return <div className={s.propertyEditor}>
    <Input
      type="number"
      value={width}
      onChange={(_, data) => setWidth(data.value)}
      style={{marginRight:10}}
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
