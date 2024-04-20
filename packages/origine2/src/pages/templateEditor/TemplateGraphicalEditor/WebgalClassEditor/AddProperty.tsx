import {
  CompoundButton,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle
} from "@fluentui/react-components";
import {t} from "@lingui/macro";

import {getEditorTable} from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";

export default function AddProperty(props: {dialogOpen:boolean,onOpenChange:(state:boolean)=>void, onAddProperty: (propertyName: string, propertyValue: string) => void }) {

  const propertyList = getEditorTable();

  const propertyListView = propertyList.map(item=>{
    return <CompoundButton key={item.propName} secondaryContent={item.propName} onClick={()=>{
      props.onAddProperty(item.propName,item.initialValue);
      props.onOpenChange(false);
    }}>
      {item.propLable}
    </CompoundButton>;
  });

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
          {propertyListView}
        </DialogContent>
      </DialogBody>
    </DialogSurface>
  </Dialog>;
}
