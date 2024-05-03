import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";

export default function WGCustomProperty(props: IPropertyEditorProps) {

  const [propertyValue, setPropertyValue] = useState(props.prop.propValue);

  const submit = () => {
    props.prop.propValue = propertyValue;
    props.onSubmit();
  };

  return <div className={s.propertyEditor}>
    <Input value={propertyValue} onChange={(_, data) => {
      setPropertyValue(data.value);
    }}/>
    <Button style={{marginLeft: 8}} onClick={submit}>{t`提交修改`}</Button>
  </div>;
}
