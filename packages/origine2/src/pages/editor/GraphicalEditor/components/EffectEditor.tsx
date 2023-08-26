import {logger} from "@/utils/logger";
import CommonOptions from "@/pages/editor/GraphicalEditor/components/CommonOption";
import {TextField} from "@fluentui/react";
import { Checkbox } from '@fluentui/react';
import {useValue} from "@/hooks/useValue";

export function EffectEditor(props:{
  json:string,onChange:(newJson:string)=>void
}){
  const effectObject = (()=>{
    try {
      return JSON.parse(props.json);
    }catch (e){
      logger.error('JSON 解析错误',e);
      return {};
    }
  })();

  const x = useValue(effectObject?.position?.x ?? 0);
  const y = useValue(effectObject?.position?.y ?? 0);
  const scaleX = useValue(effectObject?.scale?.x ?? 1);
  const scaleY = useValue(effectObject?.scale?.y ?? 1);
  const alpha = useValue(effectObject?.alpha ?? 1);
  const rotation = useValue(effectObject?.rotation ?? 0);
  const blur = useValue(effectObject?.blur ?? 0);
  const oldFilm = useValue(effectObject?.oldFilm ?? 0);
  const dotFilm = useValue(effectObject?.dotFilm ?? 0);
  const reflectionFilm = useValue(effectObject?.reflectionFilm ?? 0);
  const glitchFilm = useValue(effectObject?.glitchFilm ?? 0);
  const rgbFilm = useValue(effectObject?.rgbFilm ?? 0);
  const godrayFilm = useValue(effectObject?.godrayFilm ?? 0);


  const updateObject = () => {
    return {
      alpha: !isNaN(Number(alpha.value)) ? alpha.value : 1, // 添加 alpha 字段检查
      position: {
        x: !isNaN(Number(x.value)) ? x.value : 0,
        y: !isNaN(Number(y.value)) ? y.value : 0
      },
      scale: {
        x: !isNaN(Number(scaleX.value)) ? scaleX.value : 1,
        y: !isNaN(Number(scaleY.value)) ? scaleY.value : 1
      },
      rotation: !isNaN(Number(rotation.value)) ? rotation.value : 0, // 添加 rotation 字段检查
      blur: !isNaN(Number(blur.value)) ? blur.value : 0 ,// 添加 blur 字段检查
      oldFilm: oldFilm.value ? 1 : 0,
      dotFilm: dotFilm.value ? 1 : 0,
      reflectionFilm: reflectionFilm.value ? 1 : 0,
      glitchFilm: glitchFilm.value ? 1 : 0,
      rgbFilm: rgbFilm.value ? 1 : 0,
      godrayFilm: godrayFilm.value ? 1 : 0,
    };
  };



  const submit = ()=>{
    console.log(updateObject());
    props.onChange(JSON.stringify(updateObject()));
  };


  return <>
    <CommonOptions key={1} title="变换">
      X轴位移：<TextField value={x.value} onChange={(_, newValue) => {
        x.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      Y轴位移：<TextField value={y.value} onChange={(_, newValue) => {
        y.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={2} title="缩放">
      X轴缩放：<TextField value={scaleX.value} onChange={(_, newValue) => {
        scaleX.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      Y轴缩放：<TextField value={scaleY.value} onChange={(_, newValue) => {
        scaleY.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={3} title="效果">
      透明度（0-1）：<TextField value={alpha.value} onChange={(_, newValue) => {
        alpha.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      旋转角度：<TextField value={rotation.value} onChange={(_, newValue) => {
        rotation.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      高斯模糊：<TextField value={blur.value} onChange={(_, newValue) => {
        blur.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={4} title="滤镜">
      <Checkbox checked={oldFilm.value === 1} onChange={(_, newValue) => { oldFilm.set(newValue ? 1 : 0); submit(); }} /> 老电影滤镜{'\u00a0'}
      <Checkbox checked={dotFilm.value === 1} onChange={(_, newValue) => { dotFilm.set(newValue ? 1 : 0); submit(); }} /> 点状电影滤镜{'\u00a0'}
      <Checkbox checked={reflectionFilm.value === 1} onChange={(_, newValue) => { reflectionFilm.set(newValue ? 1 : 0); submit(); }} /> 反射电影滤镜{'\u00a0'}
      <Checkbox checked={glitchFilm.value === 1} onChange={(_, newValue) => { glitchFilm.set(newValue ? 1 : 0); submit(); }} /> 故障电影滤镜{'\u00a0'}
      <Checkbox checked={rgbFilm.value === 1} onChange={(_, newValue) => { rgbFilm.set(newValue ? 1 : 0); submit(); }} /> RGB电影滤镜{'\u00a0'}
      <Checkbox checked={godrayFilm.value === 1} onChange={(_, newValue) => { godrayFilm.set(newValue ? 1 : 0); submit(); }} /> 光辉电影滤镜
    </CommonOptions>
  </>;
}
