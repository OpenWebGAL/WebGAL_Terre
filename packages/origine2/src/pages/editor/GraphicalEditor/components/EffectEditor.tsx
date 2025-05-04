import {logger} from "@/utils/logger";
import CommonOptions from "@/pages/editor/GraphicalEditor/components/CommonOption";
import {useValue} from "@/hooks/useValue";
import { Checkbox, Input } from "@fluentui/react-components";
import { t } from "@lingui/macro";

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
    if(!isNaN(Number(brightness.value))&&brightness.value!==''){result.brightness = Number(brightness.value);};
    if(!isNaN(Number(contrast.value))&&contrast.value!==''){result.contrast = Number(contrast.value);};
    if(!isNaN(Number(saturation.value))&&saturation.value!==''){result.saturation = Number(saturation.value);};
    if(!isNaN(Number(gamma.value))&&gamma.value!==''){result.gamma = Number(gamma.value);};
    if(!isNaN(Number(colorRed.value))&&colorRed.value!==''){result.colorRed = Number(colorRed.value);};
    if(!isNaN(Number(colorGreen.value))&&colorGreen.value!==''){result.colorGreen = Number(colorGreen.value);};
    if(!isNaN(Number(colorBlue.value))&&colorBlue.value!==''){result.colorBlue = Number(colorBlue.value);};
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
      {t`X轴位移：`}<Input value={x.value} placeholder={t`默认值0`} onChange={(_, data) => {
        x.set(data.value);
      }} onBlur={submit}/>{'\u00a0'}

      {t`Y轴位移：`}<Input value={y.value} placeholder={t`默认值0`} onChange={(_, data) => {
        y.set(data.value);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={2} title={t`缩放`}>
      {t`X轴缩放：`}<Input value={scaleX.value} placeholder={t`默认值1`} onChange={(_, data) => {
        scaleX.set(data.value);
      }} onBlur={submit}/>{'\u00a0'}

      {t`Y轴缩放：`}<Input value={scaleY.value} placeholder={t`默认值1`} onChange={(_, data) => {
        scaleY.set(data.value);
      }} onBlur={submit}/>
    </CommonOptions>
    <CommonOptions key={3} title={t`效果`}>
      {t`透明度（0-1）：`}<Input value={alpha.value} placeholder={t`默认值1`} onChange={(_, data) => {
        alpha.set(data.value);
      }} onBlur={submit} style={{width: '140px'}}/>{'\u00a0'}

      {t`旋转角度：`}<Input value={rotation.value} placeholder={t`默认值0`} onChange={(_, data) => {
        rotation.set(data.value);
      }} onBlur={submit} style={{width: '140px'}}/>{'\u00a0'}

      {t`高斯模糊：`}<Input value={blur.value} placeholder={t`默认值0`} onChange={(_, data) => {
        blur.set(data.value);
      }} onBlur={submit} style={{width: '140px'}}/>
    </CommonOptions>
    <CommonOptions key={4} title={t`颜色调整`}>
      <div>
        <div>
          {t`亮度：`}<Input value={brightness.value} placeholder={t`默认值1`} onChange={(_, data) => {
            brightness.set(data.value);
          }} onBlur={submit} style={{width: '100px'}}/>{'\u00a0'}
          {t`对比度：`}<Input value={contrast.value} placeholder={t`默认值1`} onChange={(_, data) => {
            contrast.set(data.value);
          }} onBlur={submit} style={{width: '100px'}}/>{'\u00a0'}
          {t`饱和度：`}<Input value={saturation.value} placeholder={t`默认值1`} onChange={(_, data) => {
            saturation.set(data.value);
          }} onBlur={submit} style={{width: '100px'}}/>{'\u00a0'}
          {t`伽马值：`}<Input value={gamma.value} placeholder={t`默认值1`} onChange={(_, data) => {
            gamma.set(data.value);
          }} onBlur={submit} style={{width: '100px'}}/>{'\u00a0'}
        </div>
        <div style={{marginTop: 5}}>
          {t`红色（0-255）：`}<Input value={colorRed.value} placeholder={t`默认值255`} onChange={(_, data) => {
            colorRed.set(data.value);
          }} onBlur={submit} style={{width: '120px'}}/>{'\u00a0'}
          {t`绿色（0-255）：`}<Input value={colorGreen.value} placeholder={t`默认值255`} onChange={(_, data) => {
            colorGreen.set(data.value);
          }} onBlur={submit} style={{width: '120px'}}/>{'\u00a0'}
          {t`蓝色（0-255）：`}<Input value={colorBlue.value} placeholder={t`默认值255`} onChange={(_, data) => {
            colorBlue.set(data.value);
          }} onBlur={submit} style={{width: '120px'}}/>{'\u00a0'}
        </div>
      </div>
    </CommonOptions>
    <CommonOptions key={5} title={t`滤镜`}>
      <Checkbox checked={oldFilm.value === 1} onChange={(_, data) => { oldFilm.set(data.checked ? 1 : 0); submit(); }} label={t`老电影滤镜`} />{'\u00a0'}
      <Checkbox checked={dotFilm.value === 1} onChange={(_, data) => { dotFilm.set(data.checked ? 1 : 0); submit(); }} label={t`点状电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={reflectionFilm.value === 1} onChange={(_, data) => { reflectionFilm.set(data.checked ? 1 : 0); submit(); }} label={t`反射电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={glitchFilm.value === 1} onChange={(_, data) => { glitchFilm.set(data.checked ? 1 : 0); submit(); }} label={t`故障电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={rgbFilm.value === 1} onChange={(_, data) => { rgbFilm.set(data.checked ? 1 : 0); submit(); }} label={t`RGB电影滤镜`}/>{'\u00a0'}
      <Checkbox checked={godrayFilm.value === 1} onChange={(_, data) => { godrayFilm.set(data.checked ? 1 : 0); submit(); }} label={t`光辉电影滤镜`}/>
    </CommonOptions>
  </>;
}
