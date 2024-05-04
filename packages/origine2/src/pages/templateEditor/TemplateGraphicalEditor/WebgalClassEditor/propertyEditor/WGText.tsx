import { IPropertyEditorProps } from '@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable';
import { Button, Input, Select, useId } from '@fluentui/react-components';
import s from '../propertyEditor.module.scss';
import { t } from '@lingui/macro';
import { useState } from 'react';

export default function WGTextAlignEditor(props: IPropertyEditorProps) {
  const initialValue = props.prop.propValue;
  const [align, setAlign] = useState(initialValue);

  const submit = () => {
    props.prop.propValue = align;
    props.onSubmit();
  };

  return (
    <div className={s.propertyEditor}>
      <Select value={align} onChange={(_, data) => setAlign(data.value)}>
        <option value="left">{t`左对齐`}</option>
        <option value="center">{t`居中对齐`}</option>
        <option value="right">{t`右对齐`}</option>
        <option value="justify">{t`两端对齐`}</option>
      </Select>
      <Button style={{ marginLeft: 8 }} onClick={submit}>{t`提交修改`}</Button>
    </div>
  );
}


