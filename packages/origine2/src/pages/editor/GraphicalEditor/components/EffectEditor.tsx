import {logger} from "@/utils/logger";
import { OptionCategory } from "@/pages/editor/GraphicalEditor/components/OptionCategory";
import CommonOptions from "@/pages/editor/GraphicalEditor/components/CommonOption";
import {useValue} from "@/hooks/useValue";
import { Button, Checkbox, Input } from "@fluentui/react-components";
import { t } from "@lingui/macro";
import { ColorPicker, IColor } from "@fluentui/react";
import { useState } from "react";
import styles from "./effectEditor.module.scss";
import React from "react";
import { debounce } from "lodash";

// eslint-disable-next-line complexity
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
  const brightness = useValue(effectObject?.brightness ?? '');
  const contrast = useValue(effectObject?.contrast ?? '');
  const saturation = useValue(effectObject?.saturation ?? '');
  const gamma = useValue(effectObject?.gamma ?? '');
  const colorRed = useValue(effectObject?.colorRed ?? '');
  const colorGreen = useValue(effectObject?.colorGreen ?? '');
  const colorBlue = useValue(effectObject?.colorBlue ?? '');
  const bloom = useValue(effectObject?.bloom ?? '');
  const bloomBrightness = useValue(effectObject?.bloomBrightness ?? '');
  const bloomBlur = useValue(effectObject?.bloomBlur ?? '');
  const bloomThreshold = useValue(effectObject?.bloomThreshold ?? '');
  const bevel = useValue(effectObject?.bevel ?? '');
  const bevelThickness = useValue(effectObject?.bevelThickness ?? '');
  const bevelRotation = useValue(effectObject?.bevelRotation ?? '');
  const bevelSoftness = useValue(effectObject?.bevelSoftness ?? '');
  const bevelRed = useValue(effectObject?.bevelRed ?? '');
  const bevelGreen = useValue(effectObject?.bevelGreen ?? '');
  const bevelBlue = useValue(effectObject?.bevelBlue ?? '');
  const oldFilm = useValue(effectObject?.oldFilm ?? '');
  const dotFilm = useValue(effectObject?.dotFilm ?? '');
  const reflectionFilm = useValue(effectObject?.reflectionFilm ?? '');
  const glitchFilm = useValue(effectObject?.glitchFilm ?? '');
  const rgbFilm = useValue(effectObject?.rgbFilm ?? '');
  const godrayFilm = useValue(effectObject?.godrayFilm ?? '');

  const rgbColor = (red: number, green: number, blue:number): IColor => {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const cmax = Math.max(r, g, b); const cmin = Math.min(r, g, b);
    let delta = cmax - cmin;
    
    let h = 0;
    if (delta !== 0) {
      if (cmax === r) h = ((g - b) / delta) * 60;
      else if (cmax === g) h = ((b - r) / delta) * 60 + 120;
      else h = ((r - g) / delta) * 60 + 240;
      if (h < 0) h += 360;
    }

    let s = (cmax === 0) ? 0 : (delta / cmax) * 100.0;
    let v = cmax * 100.0;

    return {
      r: red,
      g: green,
      b: blue,
      a: 100,
      h,
      s,
      v,
      hex: `${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`,
      str: `rgba(${red}, ${green}, ${blue}, 100)`,
    };
  };

  const getColor = (): IColor => {
    const r = colorRed.value === "" ? 255 : colorRed.value;
    const g = colorGreen.value === "" ? 255 : colorGreen.value;
    const b = colorBlue.value === "" ? 255 : colorBlue.value;
    return rgbColor(r, g, b);
  };

  const getBevelColor = (): IColor => {
    const r = bevelRed.value === "" ? 255 : bevelRed.value;
    const g = bevelGreen.value === "" ? 255 : bevelGreen.value;
    const b = bevelBlue.value === "" ? 255 : bevelBlue.value;
    return rgbColor(r, g, b);
  };

  const color = useValue(getColor());
  const bevelColor = useValue(getBevelColor());
  const [localColor, setLocalColor] = useState(color.value);
  const [localBevelColor, setLocalBevelColor] = useState(bevelColor.value);

  const handleLocalColorChange = debounce((ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
    setLocalColor(newColor);
    colorRed.set(newColor.r);
    colorGreen.set(newColor.g);
    colorBlue.set(newColor.b);
  }, 500);

  const handleLocalBevelColorChange = debounce((ev: React.SyntheticEvent<HTMLElement>, newColor: IColor) => {
    setLocalBevelColor(newColor);
    bevelRed.set(newColor.r);
    bevelGreen.set(newColor.g);
    bevelBlue.set(newColor.b);
  }, 500);

  // eslint-disable-next-line complexity
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
    if(!isNaN(Number(brightness.value))&&brightness.value!==''){result.brightness = Number(brightness.value);};
    if(!isNaN(Number(contrast.value))&&contrast.value!==''){result.contrast = Number(contrast.value);};
    if(!isNaN(Number(saturation.value))&&saturation.value!==''){result.saturation = Number(saturation.value);};
    if(!isNaN(Number(gamma.value))&&gamma.value!==''){result.gamma = Number(gamma.value);};
    if(!isNaN(Number(colorRed.value))&&colorRed.value!==''){result.colorRed = Number(colorRed.value);};
    if(!isNaN(Number(colorGreen.value))&&colorGreen.value!==''){result.colorGreen = Number(colorGreen.value);};
    if(!isNaN(Number(colorBlue.value))&&colorBlue.value!==''){result.colorBlue = Number(colorBlue.value);};
    if(!isNaN(Number(bloom.value))&&bloom.value!==''){result.bloom = Number(bloom.value);};
    if(!isNaN(Number(bloomBrightness.value))&&bloomBrightness.value!==''){result.bloomBrightness = Number(bloomBrightness.value);};
    if(!isNaN(Number(bloomBlur.value))&&bloomBlur.value!==''){result.bloomBlur = Number(bloomBlur.value);};
    if(!isNaN(Number(bloomThreshold.value))&&bloomThreshold.value!==''){result.bloomThreshold = Number(bloomThreshold.value);};
    if(!isNaN(Number(bevel.value))&&bevel.value!==''){result.bevel = Number(bevel.value);};
    if(!isNaN(Number(bevelThickness.value))&&bevelThickness.value!==''){result.bevelThickness = Number(bevelThickness.value);};
    if(!isNaN(Number(bevelRotation.value))&&bevelRotation.value!==''){result.bevelRotation = Number(bevelRotation.value);};
    if(!isNaN(Number(bevelSoftness.value))&&bevelSoftness.value!==''){result.bevelSoftness = Number(bevelSoftness.value);};
    if(!isNaN(Number(bevelRed.value))&&bevelRed.value!==''){result.bevelRed = Number(bevelRed.value);};
    if(!isNaN(Number(bevelGreen.value))&&bevelGreen.value!==''){result.bevelGreen = Number(bevelGreen.value);};
    if(!isNaN(Number(bevelBlue.value))&&bevelBlue.value!==''){result.bevelBlue = Number(bevelBlue.value);};
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
    <OptionCategory key={1} title={t`变换`}>
      <CommonOptions title={t`X轴位移`}>
        <Input
          value={x.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            x.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`Y轴位移`}>
        <Input
          value={y.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            y.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`旋转（弧度）`}>
        <Input
          value={rotation.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            rotation.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`X轴缩放`}>
        <Input
          value={scaleX.value}
          placeholder={t`默认值1`}
          onChange={(_, data) => {
            scaleX.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`Y轴缩放`}>
        <Input
          value={scaleY.value}
          placeholder={t`默认值1`}
          onChange={(_, data) => {
            scaleY.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
    </OptionCategory>
    <OptionCategory key={2} title={t`效果`}>
      <CommonOptions title={t`透明度（0-1）`}>
        <Input
          value={alpha.value}
          placeholder={t`默认值1`}
          onChange={(_, data) => {
            alpha.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`高斯模糊`}>
        <Input
          value={blur.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            blur.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
    </OptionCategory>
    <OptionCategory key={3} title={t`颜色调整`}>
      <ColorPicker
        color={localColor}
        alphaType="none"
        onChange={handleLocalColorChange}
      />
      <div style={{display: "flex", flexDirection: "column", alignSelf: "stretch"}}>
        <CommonOptions title={t`亮度`}>
          <Input
            value={brightness.value}
            placeholder={t`默认值1`}
            onChange={(_, data) => {
              brightness.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <CommonOptions title={t`对比度`}>
          <Input
            value={contrast.value}
            placeholder={t`默认值1`}
            onChange={(_, data) => {
              contrast.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <CommonOptions title={t`饱和度`}>
          <Input
            value={saturation.value}
            placeholder={t`默认值1`}
            onChange={(_, data) => {
              saturation.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <CommonOptions title={t`伽马值`}>
          <Input
            value={gamma.value}
            placeholder={t`默认值1`}
            onChange={(_, data) => {
              gamma.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <div style={{flexGrow: 1}}/>
        <Button
          style={{ marginBottom: '14px' }}
          onClick={submit}
        >
          {t`应用颜色变化`}
        </Button>
      </div>
    </OptionCategory>
    <OptionCategory key={4} title={t`泛光`}>
      <CommonOptions title={t`强度`}>
        <Input
          value={bloom.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            bloom.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`亮度`}>
        <Input
          value={bloomBrightness.value}
          placeholder={t`默认值1`}
          onChange={(_, data) => {
            bloomBrightness.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`模糊`}>
        <Input
          value={bloomBlur.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            bloomBlur.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
      <CommonOptions title={t`阈值`}>
        <Input
          value={bloomThreshold.value}
          placeholder={t`默认值0`}
          onChange={(_, data) => {
            bloomThreshold.set(data.value);
          }}
          onBlur={submit}/>
      </CommonOptions>
    </OptionCategory>
    <OptionCategory key={5} title={t`倒角`}>
      <ColorPicker
        color={localBevelColor}
        alphaType="none"
        onChange={handleLocalBevelColorChange}
      />
      <div style={{display: "flex", flexDirection: "column", alignSelf: "stretch"}}>
        <CommonOptions title={t`透明度（0-1）`}>
          <Input
            value={bevel.value}
            placeholder={t`默认值0`}
            onChange={(_, data) => {
              bevel.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <CommonOptions title={t`厚度`}>
          <Input
            value={bevelThickness.value}
            placeholder={t`默认值0`}
            onChange={(_, data) => {
              bevelThickness.set(data.value);
            }}
            onBlur={submit}/>
        </CommonOptions>
        <CommonOptions title={t`旋转（角度）`}>
          <Input
            value={bevelRotation.value}
            placeholder={t`默认值0`}
            onChange={(_, data) => {
              bevelRotation.set(data.value);
            }}
            onBlur={submit}/>
          <div style={{flexGrow: 1}}/>
        </CommonOptions>
        <CommonOptions title={t`软化（0-1）`}>
          <Input
            value={bevelSoftness.value}
            placeholder={t`默认值0`}
            onChange={(_, data) => {
              bevelSoftness.set(data.value);
            }}
            onBlur={submit}/>
          <div style={{flexGrow: 1}}/>
        </CommonOptions>
        <div style={{flexGrow: 1}}/>
        <Button
          style={{ marginBottom: '14px' }}
          onClick={submit}
        >
          {t`应用颜色变化`}
        </Button>
      </div>
    </OptionCategory>
    <OptionCategory key={6} title={t`滤镜`}>
      <Checkbox checked={oldFilm.value === 1} onChange={(_, data) => { oldFilm.set(data.checked ? 1 : 0); submit(); }} label={t`老电影滤镜`} />
      <Checkbox checked={dotFilm.value === 1} onChange={(_, data) => { dotFilm.set(data.checked ? 1 : 0); submit(); }} label={t`点状电影滤镜`}/>
      <Checkbox checked={reflectionFilm.value === 1} onChange={(_, data) => { reflectionFilm.set(data.checked ? 1 : 0); submit(); }} label={t`反射电影滤镜`}/>
      <Checkbox checked={glitchFilm.value === 1} onChange={(_, data) => { glitchFilm.set(data.checked ? 1 : 0); submit(); }} label={t`故障电影滤镜`}/>
      <Checkbox checked={rgbFilm.value === 1} onChange={(_, data) => { rgbFilm.set(data.checked ? 1 : 0); submit(); }} label={t`RGB电影滤镜`}/>
      <Checkbox checked={godrayFilm.value === 1} onChange={(_, data) => { godrayFilm.set(data.checked ? 1 : 0); submit(); }} label={t`光辉电影滤镜`}/>
    </OptionCategory>
  </>;
}
