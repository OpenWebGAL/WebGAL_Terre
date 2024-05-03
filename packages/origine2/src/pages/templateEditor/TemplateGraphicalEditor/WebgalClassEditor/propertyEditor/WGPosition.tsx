import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";

export default function WGPosition(props: IPropertyEditorProps) {

  const selectId = useId();

  return <div className={s.propertyEditor}>
    <Select value={props.prop.propValue} id={selectId} onChange={(_, data) => {
      props.prop.propValue = data.value;
      props.onSubmit();
    }}>
      <option value="static">{t`静态`}</option>
      <option value="relative">{t`相对`}</option>
      <option value="absolute">{t`绝对`}</option>
    </Select>
  </div>;
}
