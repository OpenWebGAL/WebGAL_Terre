import styles from "./TemplateSidebar.module.scss";
import { ChangeEvent, useRef, useState } from "react";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1, Toast, Toaster, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { AddFilled, AddRegular, ArrowImport24Filled, ArrowImport24Regular, ArrowSyncFilled, ArrowSyncRegular, bundleIcon } from "@fluentui/react-icons";
import TemplateElement from "./TemplateElement";
import {t} from "@lingui/macro";
import { CreateTemplateDto, TemplateInfoDto } from "@/api/Api";
import normalizeFileName from "@/utils/normalizeFileName";
import { api } from "@/api";

interface ITemplateSidebarProps {
  templateList: TemplateInfoDto[];
  currentSetTemplate: string |null;
  setCurrentTemplate: (currentTemplate: string) => void;
  createTemplate: (template: CreateTemplateDto) => void;
  refreash?: () => void;
}

const AddIcon = bundleIcon(AddFilled, AddRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);
const ArrowImportIcon = bundleIcon(ArrowImport24Filled, ArrowImport24Regular);

export default function TemplateSidebar(props:ITemplateSidebarProps){

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createTemplateFormOpen, setCreateTemplateFormOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState(t`新的模板`);
  const [newTemplateDir, setNewTemplateDir] = useState(t`新的模板`);
  const toasterId = useId("template-toaster");
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId);

  const isAllowCreate = newTemplateName
    && newTemplateName.trim() !== ''
    && newTemplateDir
    && newTemplateDir.trim() !== ''
    && !props.templateList.find((item) => item.dir === newTemplateDir.trim());

  function createNewTemplate() {
    if (isAllowCreate) {
      props.createTemplate({templateName: newTemplateName, templateDir: newTemplateDir});
      setCreateTemplateFormOpen(false);
      setNewTemplateName(t`新的模板`);
      setNewTemplateDir(t`新的模板`);
    }
  }

  const notify = (intent: ToastIntent, content: string) => {
    dismissAllToasts();
    dispatchToast(
      <Toast>
        <ToastTitle>{content}</ToastTitle>
      </Toast>,
      { intent },
    );
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const result = await api.manageTemplateControllerImportTemplate({ file });
      if (result.data) {
        props.refreash?.();
        notify("success", t`模板导入成功`);
      } else {
        notify("error", t`模板导入失败，请检查是否存在重名或模板是否完整`);
      }
    } catch {
      notify("error", t`模板导入失败，请检查是否存在重名或模板是否完整`);
    } finally {
      event.target.value = "";
    }
  };

  return <div className={`${styles.sidebar_main}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t`模板列表`}</span>
      <div className={styles.sidebar_top_buttons}>
        <Popover
          withArrow
          trapFocus
          open={createTemplateFormOpen}
          onOpenChange={() => setCreateTemplateFormOpen(!createTemplateFormOpen)}
        >
          <PopoverTrigger>
            <Button appearance='primary' icon={<AddIcon />}>{t`新建模板`}</Button>
          </PopoverTrigger>
          <PopoverSurface>
            <form style={{display:"flex", flexDirection:"column", gap:'16px'}}>
              <Subtitle1>{t`创建新模板`}</Subtitle1>
              {t`模板名称`}
              <Input
                value={newTemplateName}
                onChange={(event) => {
                  setNewTemplateName(event.target.value);
                  newTemplateDir === normalizeFileName(newTemplateName) && setNewTemplateDir(normalizeFileName(event.target.value));
                }}
                onKeyDown={(event) => (event.key === 'Enter') && createNewTemplate()}
                defaultValue={t`新的模板`}
                placeholder={t`模板名称`}
              />
              {t`模板目录`}
              <Input
                value={newTemplateDir}
                onChange={(event) => setNewTemplateDir(event.target.value)}
                onKeyDown={(event) => (event.key === 'Enter') && createNewTemplate()}
                defaultValue={t`新的模板`}
                placeholder={t`模板目录`}
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button appearance='primary' disabled={!isAllowCreate} onClick={createNewTemplate} >{t`创建`}</Button>
              </div>
            </form>
          </PopoverSurface>
        </Popover>
        <Button appearance='secondary' onClick={props.refreash} icon={<ArrowSyncIcon />} />
        <input
          type="file"
          accept=".zip"
          style={{display: "none"}}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button appearance='secondary' icon={<ArrowImportIcon />} onClick={() => fileInputRef.current?.click()}>{t`导入模板`}</Button>
      </div>
    </div>
    <div className={styles.game_list}>
      {
        props.templateList.map(e => {
          const checked = props.currentSetTemplate === e.dir;
          return <TemplateElement
            onClick={()=>{}}
            refreash={props.refreash}
            notify={notify}
            templateInfo={e}
            key={e.dir}
            checked={checked}
          />;
        })
      }
    </div>
    <Toaster toasterId={toasterId} />
  </div>;
}
