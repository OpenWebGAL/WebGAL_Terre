import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";

export default function WGCursor(props: IPropertyEditorProps) {

  const selectId = useId();

  return <div className={s.propertyEditor}>
    <Select value={props.prop.propValue} id={selectId} onChange={(_, data) => {
      props.prop.propValue = data.value;
      props.onSubmit();
    }}>
      <option value="auto">{t`自动`}</option>
      <option value="none">{t`无`}</option>
      <option value="pointer">{t`指针`}</option>
    </Select>
  </div>;
}