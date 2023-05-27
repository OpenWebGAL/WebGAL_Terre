import { DeleteOne, Editor } from "@icon-park/react";
import { ReactElement } from "react";
import styles from "./sidebarComponents.module.scss";
import { useValue } from "../../../../hooks/useValue";
import { Callout, DefaultButton, PrimaryButton, Text, TextField } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import useTrans from "@/hooks/useTrans";
import documentLogo from "material-icon-theme/icons/document.svg";
import IconWrapper from "@/components/iconWrapper/IconWrapper";

export interface IFileElementProps {
  name: string;
  fileType?: string;
  editFileNameCallback?: Function;
  clickCallback?: Function;
  deleteCallback?: Function;
  icon?: ReactElement;
}


export default function FileElement(props: IFileElementProps) {
  const t = useTrans("editor.sideBar.file.dialogs.");

  const icon = props.icon ?? <IconWrapper src={documentLogo} size={22} iconSize={20} />;

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
  const delteFileCallback = () => {
    props?.deleteCallback && props.deleteCallback();
  };

  const showDeleteCalllout = useValue(false);

  const editNameButtonId = useId(`editNameButton`);
  const deleteButtonId = useId("deleteButton");


  // @ts-ignore
  // @ts-ignore
  return <div className={styles.fileElement} onClick={clickCallback}>
    <div className={styles.fileElement_icon}>{icon}</div>
    <div className={styles.fileElement_name}>{props.name}</div>
    <div id={`current_${props.name}`} style={{
      display: showEditNameCallout.value ? "block" : undefined
    }} className={styles.fileElement_interactable_icon} onClick={(e) => {
      e.stopPropagation();
      switchEditNameCallout();
    }}>
      <Editor id={editNameButtonId} theme="outline" size="18" fill="#333" strokeWidth={3} />
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
          {t("editName.title")}
        </Text>
        <div>
          <TextField defaultValue={newFileName.value} onChange={updateNewFilename} label={t("editName.text")} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "5px 0 5px 0" }}>
          <PrimaryButton text={t("$common.revise")} onClick={commitNewFileName} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
    <div style={{
      display: showEditNameCallout.value ? "block" : undefined
    }} className={styles.fileElement_interactable_icon} onClick={(e) => {
      e.stopPropagation();
      showDeleteCalllout.set(!showDeleteCalllout.value);
    }}>
      <DeleteOne id={deleteButtonId} theme="outline" size="18" fill="#333" strokeWidth={3} />
      {showDeleteCalllout.value && <Callout
        className={styles.callout}
        ariaLabelledBy="deleteFile"
        ariaDescribedBy="deleteFile"
        role="dialog"
        gapSpace={0}
        target={`#${deleteButtonId}`}
        onDismiss={() => {
          showDeleteCalllout.set(false);
        }}
        setInitialFocus
        style={{ width: "300px", padding: "5px 10px 5px 10px" }}
      >
        <Text block variant="xLarge" className={styles.title} id="editNameTitle">
          {t({ key: "delete.text", format: { name: props.name } })}
        </Text>
        <div style={{ display: "flex", justifyContent: "space-evenly", padding: "5px 0 5px 0" }}>
          <PrimaryButton text={t("$common.delete")} onClick={delteFileCallback} allowDisabledFocus />
          <DefaultButton text={t("$common.cancel")} onClick={() => {
            showDeleteCalllout.set(false);
          }} allowDisabledFocus />
        </div>
      </Callout>}
    </div>
  </div>;
}
