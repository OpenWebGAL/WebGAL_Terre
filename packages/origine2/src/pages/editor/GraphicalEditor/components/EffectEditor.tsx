import {logger} from "@/utils/logger";
import CommonOptions from "@/pages/editor/GraphicalEditor/components/CommonOption";
import {TextField} from "@fluentui/react";
import { Checkbox } from '@fluentui/react';
import {useValue} from "@/hooks/useValue";
import useTrans from "@/hooks/useTrans";

export function EffectEditor(props:{
  json:string,onChange:(newJson:string)=>void
}){
  const t = useTrans('editor.graphical.sentences.transform.');

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
    <CommonOptions key={1} title={t('transform.title')}>
      {t('transform.x')}<TextField value={x.value} onChange={(_, newValue) => {
        x.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      {t('transform.y')}<TextField value={y.value} onChange={(_, newValue) => {
        y.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={2} title={t('scale.title')}>
      {t('scale.x')}<TextField value={scaleX.value} onChange={(_, newValue) => {
        scaleX.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      {t('scale.y')}<TextField value={scaleY.value} onChange={(_, newValue) => {
        scaleY.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={3} title={t('effect.title')}>
      {t('effect.alpha')}<TextField value={alpha.value} onChange={(_, newValue) => {
        alpha.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      {t('effect.rotation')}<TextField value={rotation.value} onChange={(_, newValue) => {
        rotation.set(newValue);
      }} onBlur={submit}/>{'\u00a0'}

      {t('effect.blur')}<TextField value={blur.value} onChange={(_, newValue) => {
        blur.set(newValue);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={4} title={t('filter.title')}>
      <Checkbox checked={oldFilm.value === 1} onChange={(_, newValue) => { oldFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.oldFilm')}{'\u00a0'}
      <Checkbox checked={dotFilm.value === 1} onChange={(_, newValue) => { dotFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.dotFilm')}{'\u00a0'}
      <Checkbox checked={reflectionFilm.value === 1} onChange={(_, newValue) => { reflectionFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.reflectionFilm')}{'\u00a0'}
      <Checkbox checked={glitchFilm.value === 1} onChange={(_, newValue) => { glitchFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.glitchFilm')}{'\u00a0'}
      <Checkbox checked={rgbFilm.value === 1} onChange={(_, newValue) => { rgbFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.rgbFilm')}{'\u00a0'}
      <Checkbox checked={godrayFilm.value === 1} onChange={(_, newValue) => { godrayFilm.set(newValue ? 1 : 0); submit(); }} />{t('filter.godrayFilm')}
    </CommonOptions>
  </>;
}
