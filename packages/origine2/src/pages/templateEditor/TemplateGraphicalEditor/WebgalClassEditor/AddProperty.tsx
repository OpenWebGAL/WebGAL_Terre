import {
  Button,
  CompoundButton,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle, Input
} from "@fluentui/react-components";
import {t} from "@lingui/macro";

import {getEditorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import {useState} from "react";

export default function AddProperty(props: {
  dialogOpen: boolean,
  onOpenChange: (state: boolean) => void,
  onAddProperty: (propertyName: string, propertyValue: string) => void
}) {

  const propertyList = getEditorTable();

  const propertyListView = propertyList.map(item => {
    return <CompoundButton key={item.propName} secondaryContent={item.propName} onClick={() => {
      props.onAddProperty(item.propName, item.initialValue);
      props.onOpenChange(false);
    }}>
      {item.propLable}
    </CompoundButton>;
  });

  const [customPropertyName, setCustorPropertyName] = useState('');
  const [customPropertyValue, setCustorPropertyValue] = useState('');

  const AddCustomPropertyView = <div style={{display: 'flex', gap: '8px', alignItems: "center", marginTop: 4}}>
    {t`CSS 属性名：`}<Input
      style={{width: 75}}
      value={customPropertyName}
      onChange={(ev, data) => {
        setCustorPropertyName(data.value);
      }}/>
    {t`CSS 属性值`}<Input
      value={customPropertyValue}
      style={{width: 125}}
      onChange={(ev, data) => {
        setCustorPropertyValue(data.value);
      }}/>
    <Button onClick={() => {
      props.onAddProperty(customPropertyName, customPropertyValue);
      props.onOpenChange(false);
    }}>{t`添加`}</Button>
  </div>;

  return <Dialog
    open={props.dialogOpen}
    onOpenChange={(event, data) => {
      props.onOpenChange(data.open);
    }}
  >
    <DialogSurface>
      <DialogBody>
        <DialogTitle>{t`添加属性`}</DialogTitle>
        <DialogContent>
          <div style={{display: 'flex', flexWrap: "wrap", gap: '8px'}}>
            {propertyListView}
          </div>
          <div style={{marginTop:16}}><b>{t`添加自定义属性`}</b></div>
          {AddCustomPropertyView}
        </DialogContent>
      </DialogBody>
    </DialogSurface>
  </Dialog>;
}
