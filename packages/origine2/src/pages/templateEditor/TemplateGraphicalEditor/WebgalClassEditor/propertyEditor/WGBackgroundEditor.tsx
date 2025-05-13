import {IPropertyEditorProps} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {Button, Input, Popover, PopoverSurface, PopoverTrigger, Select, useId} from "@fluentui/react-components";
import s from '../propertyEditor.module.scss';
import {t} from "@lingui/macro";
import {useState} from "react";
import WGColorPicker
  from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/propertyEditor/components/WGColorPicker";
import ChooseFile from "@/pages/editor/ChooseFile/ChooseFile";
import useEditorStore from "@/store/useEditorStore";
import { dirNameToExtNameMap } from "@/pages/editor/ChooseFile/chooseFileConfig";


type InputType = 'hex' | 'image' | 'gradient' | 'unknown'


export default function WGBackgroundEditor(props: IPropertyEditorProps) {
  const initialValue = props.prop.propValue;
  const [value, setValue] = useState(initialValue);
  const templateName = useEditorStore.use.subPage();

  // 判断是颜色、渐变还是图像
  function determineInputType(input: string): InputType {
    // Regular expression to match hex color codes
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

    // Regular expression to match image URLs
    const imageUrlRegex = /^url\(["']?.+["']?\)$/;

    // Regular expression to match linear-gradient or other gradient functions
    const gradientRegex = /^(linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient)\(.+\)/;

    if (hexColorRegex.test(input)) {
      return "hex";
    } else if (imageUrlRegex.test(input)) {
      return "image";
    } else if (gradientRegex.test(input)) {
      return "gradient";
    } else {
      return "unknown";
    }
  }

  const detectValueType = determineInputType(initialValue);
  const [valueType, setValueType] = useState(detectValueType);
  const [isShowColorPicker, setIsShowColorPicker] = useState(false);


  // 对于不同的值类型，写出对应的编辑器
  const selector = <Select value={valueType} onChange={(_, data) => setValueType(data.value as InputType)}>
    <option value="hex">{t`颜色`}</option>
    <option value="image">{t`图像`}</option>
    <option value="gradient">{t`线性渐变`}</option>
    <option value="unknown">{t`自定义值`}</option>
  </Select>;


  const submit = () => {
    props.prop.propValue = `${value}`;
    props.onSubmit();
  };

  function extractFilePath(urlString: string): string | null {
    const regex = /url\(["']?([^"')]+)["']?\)/;
    const match = urlString.match(regex);
    return match ? match[1] : null;
  }

  const rootPath = ['templates', templateName, 'assets'];

  return <div className={s.propertyEditor}>
    {selector}
    {valueType === 'hex' && <Popover open={isShowColorPicker} onOpenChange={(_, data) => {
      setIsShowColorPicker(data.open);
    }}>
      <PopoverTrigger disableButtonEnhancement>
        <Button style={{marginLeft: 8}}>{t`修改颜色`}</Button>
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <WGColorPicker color={value} onChange={(newValue) => setValue(newValue)}/>
      </PopoverSurface>
    </Popover>}
    {(valueType === 'gradient' || valueType === 'unknown') && <Input
      value={value}
      onChange={(_, data) => setValue(data.value)}
      style={{marginLeft: 8}}
    />}
    {valueType === 'image' && <div style={{marginLeft: 8}}>
      <span>{extractFilePath(value)?.replace('game/template/assets/', '')}</span>
      <ChooseFile
        rootPath={rootPath}
        extNames={dirNameToExtNameMap.get('background')}
        onChange={(file) => {
          file && setValue(`url("game/template/assets/${file.path.replace(rootPath.join('/'), '')}")`);
        }}
      />
    </div>}
    <Button style={{marginLeft: 8}} onClick={submit}>{t`提交修改`}</Button>
  </div>;
}
