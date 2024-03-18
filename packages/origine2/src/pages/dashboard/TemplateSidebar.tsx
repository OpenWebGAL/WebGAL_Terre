import styles from "./TemplateSidebar.module.scss";
import { TemplateInfo } from "./DashBoard";
import { useState } from "react";
import useTrans from "@/hooks/useTrans";
import { Button, Input, Popover, PopoverSurface, PopoverTrigger, Subtitle1 } from "@fluentui/react-components";
import { AddFilled, AddRegular, ArrowSyncFilled, ArrowSyncRegular, bundleIcon } from "@fluentui/react-icons";
import TemplateElement from "./TemplateElement";

interface ITemplateSidebarProps {
  templateList: TemplateInfo[];
  currentSetTemplate: string |null;
  setCurrentTemplate: (currentTemplate: string) => void;
  createTemplate: (name: string) => void;
  refreash?: () => void;
}

const AddIcon = bundleIcon(AddFilled, AddRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);

export default function TemplateSidebar(props:ITemplateSidebarProps){
  const t = useTrans('');

  const [createTemplateFormOpen, setCreateTemplateFormOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState(t('新的模板') || '新的模板');

  function createNewTemplate() {
    if (newTemplateName && newTemplateName.trim() !== '' && !props.templateList.find((item) => item.dir === newTemplateName.trim())) {
      props.createTemplate(newTemplateName);
      setCreateTemplateFormOpen(false);
      setNewTemplateName(t('createNewGame.dialog.defaultName') || 'NewGame');
    }
  }

  return <div className={`${styles.sidebar_main}`}>
    <div className={styles.sidebar_top}>
      <span className={styles.sidebar_top_title}>{t('模板列表')}</span>
      <div className={styles.sidebar_top_buttons}>
        <Popover
          withArrow
          trapFocus
          open={createTemplateFormOpen}
          onOpenChange={() => setCreateTemplateFormOpen(!createTemplateFormOpen)}
        >
          <PopoverTrigger>
            <Button appearance='primary' icon={<AddIcon />}>{t('新建模板')}</Button>
          </PopoverTrigger>
          <PopoverSurface>
            <form style={{display:"flex", flexDirection:"column", gap:'8px'}}>
              <Subtitle1>{t('创建新模板')}</Subtitle1>
              <Input
                value={newTemplateName}
                onChange={(event) => setNewTemplateName(event.target.value)}
                onKeyDown={(event) => (event.key === 'Enter') && createNewTemplate()}
                defaultValue={t('新模板名')}
                placeholder={t('新建模板')} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button appearance='primary' onClick={createNewTemplate} >{t('$common.create')}</Button>
              </div>
            </form>
          </PopoverSurface>
        </Popover>
        <Button appearance='secondary' onClick={props.refreash} icon={<ArrowSyncIcon />} />     
      </div>
    </div>
    <div className={styles.game_list}>
      {
        props.templateList.map(e => {
          const checked = props.currentSetTemplate === e.dir;
          return <TemplateElement
            onClick={()=>{}}
            refreash={props.refreash}
            templateInfo={e}
            key={e.dir}
            checked={checked}
          />;
        })
      }
    </div>
  </div>;
}
