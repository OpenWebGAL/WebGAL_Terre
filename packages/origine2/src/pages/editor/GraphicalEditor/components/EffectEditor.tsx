import {logger} from "@/utils/logger";
import CommonOptions from "@/pages/editor/GraphicalEditor/components/CommonOption";
import {useValue} from "@/hooks/useValue";
import { Checkbox, Input } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import {InputProps} from "@fluentui/react-input";
import React, {useRef, useState} from "react";
import {Slider} from "@fluentui/react-components";

interface AdjustableProps extends InputProps {
  step?: number;
}
interface KeysPressed {
  [key: string]: boolean;
}

const AdjustableInput = ({ value, onChange, onBlur, placeholder, style, step = 10}: AdjustableProps) => {
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const slideRef = useRef<HTMLInputElement>(null);

  const [keysPressed, setKeysPressed] = useState<KeysPressed>({});
  const handleKeyDown = (event: { key: any; }) => {
    setKeysPressed((prevKeys) => ({
      ...prevKeys,
      [event.key]: true
    }));
  };

  const handleKeyUp = (event: { key: any; }) => {
    setKeysPressed((prevKeys) => ({
      ...prevKeys,
      [event.key]: false
    }));
  };

  const handleMouseDown = (e: { clientX: number; }) => {
    setDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    if (inputRef.current) {
      if (onBlur) {
        const blur = onBlur as () => void;
        blur();
      }
    }
  };

  const handleMouseMove = (e: { clientX: number; }) => {
    if (!dragging) return;
    let deltaX = e.clientX - startX;
    if (inputRef.current) {
      if (keysPressed['Shift']) deltaX = deltaX * 0.125;
      const newValue = Number(inputRef.current.value) + deltaX * step;
      inputRef.current.value = newValue.toString();
      setStartX(e.clientX);
      if (onChange) {
        onChange(e as unknown as React.ChangeEvent<HTMLInputElement>, {value: newValue.toString()});
      }
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
    }}>
      <Input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={style}
        onBlur={onBlur}
      />
      <Slider
        ref={slideRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        defaultValue={50}/>
    </div>
  );
};

export function EffectEditor(props:{
  json:string,onChange:(newJson:string)=>void
}){

  const effectObject = (()=>{
    try {
      if(props.json===''){
        return JSON.parse('{}');
      }
      return JSON.parse(props.json);
    }catch (e){
      logger.error('JSON 解析错误',e);
      return {};
    }
  })();

  const x = useValue(effectObject?.position?.x ?? '');
  const y = useValue(effectObject?.position?.y ?? '');
  const scaleX = useValue(effectObject?.scale?.x ?? '');
  const scaleY = useValue(effectObject?.scale?.y ?? '');
  const alpha = useValue(effectObject?.alpha ?? '');
  const rotation = useValue(effectObject?.rotation ?? '');
  const blur = useValue(effectObject?.blur ?? '');
  const oldFilm = useValue(effectObject?.oldFilm ?? '');
  const dotFilm = useValue(effectObject?.dotFilm ?? '');
  const reflectionFilm = useValue(effectObject?.reflectionFilm ?? '');
  const glitchFilm = useValue(effectObject?.glitchFilm ?? '');
  const rgbFilm = useValue(effectObject?.rgbFilm ?? '');
  const godrayFilm = useValue(effectObject?.godrayFilm ?? '');

  const updateObject = () => {
    const result:{[key: string]: any;} = {};
    console.log(x.value);
    console.log(!isNaN(Number(x.value))&&x.value!=='');
    if(!isNaN(Number(x.value))&&x.value!==''){result.position = result.position??{};result.position.x = Number(x.value);};
    if(!isNaN(Number(y.value))&&y.value!==''){result.position = result.position??{};result.position.y = Number(y.value);};
    if(!isNaN(Number(scaleX.value))&&scaleX.value!==''){result.scale = result.scale??{};result.scale.x = Number(scaleX.value);};
    if(!isNaN(Number(scaleY.value))&&scaleY.value!==''){result.scale = result.scale??{};result.scale.y = Number(scaleY.value);};
    if(!isNaN(Number(alpha.value))&&alpha.value!==''){result.alpha = Number(alpha.value);};
    if(!isNaN(Number(rotation.value))&&rotation.value!==''){result.rotation = Number(rotation.value);};
    if(!isNaN(Number(blur.value))&&blur.value!==''){result.blur = Number(blur.value);};
    if(oldFilm.value){result.oldFilm = 1;};
    if(dotFilm.value){result.dotFilm = 1;};
    if(reflectionFilm.value){result.reflectionFilm = 1;};
    if(glitchFilm.value){result.glitchFilm = 1;};
    if(rgbFilm.value){result.rgbFilm = 1;};
    if(godrayFilm.value){result.godrayFilm = 1;};
    console.log(result);
    return result;

    // return {
    //   alpha: !isNaN(Number(alpha.value)) ? Number(alpha.value) : 1, // Convert alpha to number
    //   position: {
    //     x: !isNaN(Number(x.value)) ? Number(x.value) : 0, // Convert x to number
    //     y: !isNaN(Number(y.value)) ? Number(y.value) : 0  // Convert y to number
    //   },
    //   scale: {
    //     x: !isNaN(Number(scaleX.value)) ? Number(scaleX.value) : 1, // Convert scaleX to number
    //     y: !isNaN(Number(scaleY.value)) ? Number(scaleY.value) : 1  // Convert scaleY to number
    //   },
    //   rotation: !isNaN(Number(rotation.value)) ? Number(rotation.value) : 0, // Convert rotation to number
    //   blur: !isNaN(Number(blur.value)) ? Number(blur.value) : 0 , // Convert blur to number
    //   oldFilm: oldFilm.value ? 1 : 0,
    //   dotFilm: dotFilm.value ? 1 : 0,
    //   reflectionFilm: reflectionFilm.value ? 1 : 0,
    //   glitchFilm: glitchFilm.value ? 1 : 0,
    //   rgbFilm: rgbFilm.value ? 1 : 0,
    //   godrayFilm: godrayFilm.value ? 1 : 0,
    // };
  };

  const submit = ()=>{
    console.log(updateObject());
    props.onChange(JSON.stringify(updateObject()));
  };


  return <>
    <CommonOptions key={1} title={t`变换`}>
      {t`X轴位移：`}<AdjustableInput value={x.value} placeholder={t`默认值0`} onChange={(_, data) => {
        x.set(data.value);
      }} onBlur={submit} step={20}/>{'\u00a0'}

      {t`Y轴位移：`}<AdjustableInput value={y.value} placeholder={t`默认值0`} onChange={(_, data) => {
        y.set(data.value);
      }} onBlur={submit} step={20}/>
    </CommonOptions>
    <CommonOptions key={2} title={t`缩放`}>
      {t`X轴缩放：`}<AdjustableInput value={scaleX.value} placeholder={t`默认值1`} onChange={(_, data) => {
        scaleX.set(data.value);
      }} onBlur={submit} step={0.125}/>{'\u00a0'}

      {t`Y轴缩放：`}<AdjustableInput value={scaleY.value} placeholder={t`默认值1`} onChange={(_, data) => {
        scaleY.set(data.value);
      }} onBlur={submit} step={0.125}/>
    </CommonOptions>
    <CommonOptions key={3} title={t`效果`}>
      {t`透明度（0-1）：`}<AdjustableInput value={alpha.value} placeholder={t`默认值1`} onChange={(_, data) => {
        alpha.set(data.value);
      }} onBlur={submit} style={{width: '140px'}} step={0.125}/>{'\u00a0'}

      {t`旋转角度：`}<AdjustableInput value={rotation.value} placeholder={t`默认值0`} onChange={(_, data) => {
        rotation.set(data.value);
      }} onBlur={submit} style={{width: '140px'}} step={0.125}/>{'\u00a0'}

      {t`高斯模糊：`}<AdjustableInput value={blur.value} placeholder={t`默认值0`} onChange={(_, data) => {
        blur.set(data.value);
      }} onBlur={submit} style={{width: '140px'}} step={0.125}/>
    </CommonOptions>
    <CommonOptions key={4} title={t`滤镜`}>
      <Checkbox checked={oldFilm.value === 1} onChange={(_, data) => { oldFilm.set(data.checked ? 1 : 0); submit(); }} label={t`老电影滤镜`} />{'\u00a0'}
      <Checkbox checked={dotFilm.value === 1} onChange={(_, data) => { dotFilm.set(data.checked ? 1 : 0); submit(); }} label={t`点状电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={reflectionFilm.value === 1} onChange={(_, data) => { reflectionFilm.set(data.checked ? 1 : 0); submit(); }} label={t`反射电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={glitchFilm.value === 1} onChange={(_, data) => { glitchFilm.set(data.checked ? 1 : 0); submit(); }} label={t`故障电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={rgbFilm.value === 1} onChange={(_, data) => { rgbFilm.set(data.checked ? 1 : 0); submit(); }} label={t`RGB电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={godrayFilm.value === 1} onChange={(_, data) => { godrayFilm.set(data.checked ? 1 : 0); submit(); }} label={t`光辉电影滤镜`}/>
    </CommonOptions>
  </>;
}
