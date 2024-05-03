import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";

export default function WGCommonNumberEditor(props: IPropertyEditorProps) {
  const initialValue = props.prop.propValue;
  const [value, setValue] = useState(initialValue);

  const submit = () => {
    props.prop.propValue = `${value}`;
    props.onSubmit();
  };

  return <div className={s.propertyEditor}>
    <Input
      value={value}
      onChange={(_, data) => setValue(data.value)}
      style={{marginRight:10}}
    />
    <Button style={{marginLeft: 8}} onClick={submit}>{t`提交修改`}</Button>
  </div>;
}
