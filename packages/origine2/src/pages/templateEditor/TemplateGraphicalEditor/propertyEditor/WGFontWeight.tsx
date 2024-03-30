import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/propertyEditor/index";
import {Select, useId} from "@fluentui/react-components";

export default function WGFontWeight(props:IPropertyEditorProps){

  const selectId = useId();

  return <div>
    字重
    <Select value={props.prop.propValue} id={selectId} onChange={(_,data)=>{
      props.prop.propValue = data.value;
      props.onSubmit();
    }}>
      <option>normal</option>
      <option>bold</option>
    </Select>
  </div>;
}
