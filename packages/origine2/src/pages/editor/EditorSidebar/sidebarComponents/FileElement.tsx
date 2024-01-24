import { DeleteOne, Editor } from "@icon-park/react";
import { ReactElement } from "react";
import styles from "./sidebarComponents.module.scss";
import { useValue } from "../../../../hooks/useValue";
import useTrans from "@/hooks/useTrans";
import documentLogo from "material-icon-theme/icons/document.svg";
import IconWrapper from "@/components/iconWrapper/IconWrapper";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Text } from "@fluentui/react-components";

export interface IFileElementProps {
  name: string;
  fileType?: string;
  editFileNameCallback?: Function;
  clickCallback?: Function;
  deleteCallback?: Function;
  icon?: ReactElement;
  undeletable?: boolean;
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
  const deleteFileCallback = () => {
    if (!props?.undeletable) props?.deleteCallback && props.deleteCallback();
  };

  const showDeleteCalllout = useValue(false);

  return (
    <div className={styles.fileElement} onClick={clickCallback}>
      <div className={styles.fileElement_icon}>{icon}</div>
      <div className={styles.fileElement_name}>{props.name}</div>
      <Popover
        withArrow
        open={showEditNameCallout.value}
        onOpenChange={switchEditNameCallout}
      >
        <PopoverTrigger>
          <div 
            style={{display: showEditNameCallout.value ? "block" : undefined}} 
            className={styles.fileElement_interactable_icon} 
            onClick={(e) => e.stopPropagation()}
          >
            <Editor theme="outline" size="18" strokeWidth={3} />
          </div>
        </PopoverTrigger>
        <PopoverSurface onClick={(e) => e.stopPropagation()}>
          <Text as="h3" block size={500} id="editNameTitle">
            {t("editName.title")}
          </Text>
          <div>
            <Input defaultValue={newFileName.value} onChange={updateNewFilename} placeholder={t("editName.text")} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "5px 0 5px 0" }}>
            <Button appearance="primary" onClick={commitNewFileName}>{t("$common.revise")}</Button>
          </div>
        </PopoverSurface>
      </Popover>
      <Popover
        withArrow
        open={showDeleteCalllout.value}
        onOpenChange={() => showDeleteCalllout.set(!showDeleteCalllout.value)}
      >
        <PopoverTrigger>
          {
            !props?.undeletable 
              ? <div
                style={{ display: showEditNameCallout.value ? "block" : undefined}} 
                className={styles.fileElement_interactable_icon} 
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteOne theme="outline" size="18" strokeWidth={3} />
              </div>
              : <div />
          }
        </PopoverTrigger>
        <PopoverSurface onClick={(e) => e.stopPropagation()}>
          <Text as="h3" block size={500} id="editNameTitle">
            {t({ key: "delete.text", format: { name: props.name } })}
          </Text>
          <div style={{ display: "flex", justifyContent: "space-evenly", gap: "8px", padding: "5px 0 5px 0" }}>
            <Button onClick={() => showDeleteCalllout.set(false)}  > {t("$common.cancel")} </Button>
            <Button appearance="primary" onClick={deleteFileCallback}  >{t("$common.delete")}</Button>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
}
