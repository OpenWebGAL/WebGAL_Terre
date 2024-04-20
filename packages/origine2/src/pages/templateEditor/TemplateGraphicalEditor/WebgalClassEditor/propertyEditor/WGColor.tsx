import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Popover, PopoverSurface, PopoverTrigger, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";
import WGColorPicker
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/components/WGColorPicker";

export default function WGColor(props: IPropertyEditorProps) {



  const [color, setColor] = useState(props.prop.propValue);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);

  const submitColor = () => {
    props.prop.propValue = color;
    setIsShowColorPicker(false);
    props.onSubmit();
  };


  return <div className={s.propertyEditor}>
    <div style={{width: 18, height: 18, backgroundColor: color, border: '1px solid #000000'}}/>
    <div style={{margin: '0 5px'}}>
      {color}
    </div>
    <Popover open={isShowColorPicker} onOpenChange={(_, data) => {
      // 恢复编辑值为默认
      setColor(props.prop.propValue);
      setIsShowColorPicker(data.open);
    }}>
      <PopoverTrigger disableButtonEnhancement>
        <Button>{t`修改颜色`}</Button>
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <WGColorPicker color={color} onChange={(newValue)=>setColor(newValue)}/>
        <Button onClick={submitColor}>{t`提交`}</Button>
      </PopoverSurface>
    </Popover>
  </div>;
}
