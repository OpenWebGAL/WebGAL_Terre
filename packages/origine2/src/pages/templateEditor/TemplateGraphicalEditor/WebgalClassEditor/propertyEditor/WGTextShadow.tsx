import {useState} from 'react';
import {Button, Input, Select} from '@fluentui/react-components';
import {t} from '@lingui/macro';
import s from '../propertyEditor.module.scss';
import {IPropertyEditorProps} from '@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable';

export default function WGTextShadowEditor(props: IPropertyEditorProps) {
  const initialValue = props.prop.propValue || '0px 0px 0px rgba(0,0,0,0)'; // 默认值为无阴影
  const [hOffset, setHOffset] = useState((initialValue.match(/(-?\d+)px/) || [, '0'])[1]);
  const [vOffset, setVOffset] = useState((initialValue.match(/-?\d+px\s+(-?\d+)px/) || [, '0'])[1]);
  const [blurRadius, setBlurRadius] = useState((initialValue.match(/(-?\d+)px\s+rgba/) || [, '0'])[1]);
  const [color, setColor] = useState((initialValue.match(/rgba\(.+\)/) || ['rgba(0,0,0,0)'])[0]);

  const submit = () => {
    props.prop.propValue = `${hOffset}px ${vOffset}px ${blurRadius}px ${color}`;
    props.onSubmit();
  };

  return (
    <div className={s.propertyEditor}>
      <Input type="number" value={hOffset} onChange={(_, data) => setHOffset(data.value)}
        style={{marginRight: 10, width: 70}}/>
      <Input type="number" value={vOffset} onChange={(_, data) => setVOffset(data.value)}
        style={{marginRight: 10, width: 70}}/>
      <Input
        type="number"
        value={blurRadius}
        onChange={(_, data) => setBlurRadius(data.value)}
        style={{marginRight: 10, width: 70}}
      />
      <Input value={color} onChange={(_, data) => setColor(data.value)} style={{marginRight: 10}}/>
      <Button style={{marginLeft: 8}} onClick={submit}>{t`提交修改`}</Button>
    </div>
  );
}
