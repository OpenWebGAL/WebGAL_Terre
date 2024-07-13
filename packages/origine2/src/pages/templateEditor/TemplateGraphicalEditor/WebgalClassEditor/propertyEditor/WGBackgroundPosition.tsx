import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";

export default function WGBackgroundPosition(props: IPropertyEditorProps) {

  const selectId = useId();

  const isOther = !props.prop.propValue.match(/left|right|center|top|bottom/g);
  const initialValue = props.prop.propValue;
  const [value, setValue] = useState(initialValue);
  const [valueType, setValueType] = useState(isOther ? 'other' : initialValue);


  return <div className={s.propertyEditor}>
    <Select value={valueType} id={selectId} onChange={(_, data) => {
      if (data.value !== 'other') {
        props.prop.propValue = data.value;
        setValueType(data.value);
        props.onSubmit();
      } else {
        setValueType(data.value);
      }
    }}>
      <option value="center">{t`居中`}</option>
      <option value="top">{t`靠上`}</option>
      <option value="bottom">{t`靠下`}</option>
      <option value="left">{t`靠左`}</option>
      <option value="right">{t`靠右`}</option>
      <option value="other">{t`自定义`}</option>
    </Select>
    {valueType === 'other' && <><Input
      value={value}
      onChange={(_, data) => setValue(data.value)}
      style={{margin: '0 8px'}}
    />
    <Button style={{marginLeft: 8}} onClick={props.onSubmit}>{t`提交修改`}</Button>
    </>}
  </div>;
}
