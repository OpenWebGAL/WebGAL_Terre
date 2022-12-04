import { DeleteOne, Editor, Notes } from "@icon-park/react";
import React, { MouseEventHandler, ReactElement } from "react";
import styles from "./sidebarComponents.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { Callout, Text, Link, TextField, PrimaryButton, DefaultButton } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";

export interface IFileElementProps {
  name: string;
  fileType?: string;
  editFileNameCallback?: Function;
  clickCallback?: Function;
  deleteCallback?: Function;
  icon?: ReactElement;
}


export default function FileElement(props: IFileElementProps) {
  const icon = props.icon ?? <Notes theme="outline" size="24" fill="#333" strokeWidth={3} />;

  // 修改文件名部分
  const showEditNameCallout = useValue(false);
  const newFileName = useValue<string>(props.name);

  function closeEditNameCallout() {
    showEditNameCallout.set(false);
  }

  function switchEditNameCallout() {
    showEditNameCallout.set(!showEditNameCallout.value);
  }

  function updateNewFilename(event: any) {
    const newValue = event.target.value;
    newFileName.set(newValue);
  }

  function commitNewFileName() {
    if (props.editFileNameCallback)
      props.editFileNameCallback(newFileName.value);
  }

  const clickCallback = () => {
    console.log("clicked");
    props?.clickCallback && props.clickCallback();
  };

  // 删除文件部分
  const delteFileCallback = ()=>{
    props?.deleteCallback && props.deleteCallback();
  };

  const showDeleteCalllout = useValue(false);

  const editNameButtonId = useId(`editNameButton`);
  const deleteButtonId = useId('deleteButton');

  // @ts-ignore
  // @ts-ignore
  return <div className={styles.fileElement}>
    <div className={styles.fileElement_icon} onClick={clickCallback}>{icon}</div>
    <div className={styles.fileElement_name} onClick={clickCallback}>{props.name}</div>
    <div id={`current_${props.name}`} className={styles.fileElement_interactable_icon} onClick={switchEditNameCallout}>
      <Editor id={editNameButtonId} theme="outline" size="24" fill="#333" strokeWidth={3} />
      {showEditNameCallout.value && <Callout
        className={styles.callout}
        ariaLabelledBy="editName"
        ariaDescribedBy="editName"
        role="dialog"
        gapSpace={0}
        target={`#${editNameButtonId}`}
        onDismiss={closeEditNameCallout}
        setInitialFocus
        style={{ width: "300px", padding: "5px 10px 5px 10px" }}
      >
        <Text block variant="xLarge" className={styles.title} id="editNameTitle">
          修改文件名
        </Text>
        <div>
          <TextField defaultValue={newFileName.value} onChange={updateNewFilename} label="新文件名" />
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "5px 0 5px 0" }}>
          <PrimaryButton text="修改" onClick={commitNewFileName} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
    <div className={styles.fileElement_interactable_icon} onClick={()=>{showDeleteCalllout.set(!showDeleteCalllout.value);}}>
      <DeleteOne id={deleteButtonId} theme="outline" size="24" fill="#333" strokeWidth={3} />
      {showDeleteCalllout.value && <Callout
        className={styles.callout}
        ariaLabelledBy="deleteFile"
        ariaDescribedBy="deleteFile"
        role="dialog"
        gapSpace={0}
        target={`#${deleteButtonId}`}
        onDismiss={()=>{showDeleteCalllout.set(false);}}
        setInitialFocus
        style={{ width: "300px", padding: "5px 10px 5px 10px" }}
      >
        <Text block variant="xLarge" className={styles.title} id="editNameTitle">
          删除 {props.name} ？
        </Text>
        <div style={{ display: "flex", justifyContent: "space-evenly", padding: "5px 0 5px 0" }}>
          <PrimaryButton text="删除" onClick={delteFileCallback} allowDisabledFocus />
          <DefaultButton text="取消" onClick={()=>{showDeleteCalllout.set(false);}} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
  </div>;
}
