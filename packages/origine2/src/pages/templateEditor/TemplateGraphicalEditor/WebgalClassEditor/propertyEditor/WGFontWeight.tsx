import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";

export default function WGFontWeight(props: IPropertyEditorProps) {

  const selectId = useId();

  return <div className={s.propertyEditor}>
    <Select value={props.prop.propValue} id={selectId} onChange={(_, data) => {
      props.prop.propValue = data.value;
      props.onSubmit();
    }}>
      <option value="normal">{t`正常`}</option>
      <option value="bold">{t`加粗`}</option>
    </Select>
  </div>;
}
