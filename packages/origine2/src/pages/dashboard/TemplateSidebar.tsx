import styles from './TemplateSidebar.module.scss';
import { useRef, useState, ChangeEvent, useCallback } from 'react';
import {
  Button,
  Input,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Subtitle1,
  Toast,
  Toaster,
  ToastIntent,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  AddFilled,
  AddRegular,
  ArrowImport24Filled,
  ArrowImport24Regular,
  ArrowSyncFilled,
  ArrowSyncRegular,
  bundleIcon,
} from '@fluentui/react-icons';
import TemplateElement from './TemplateElement';
import { t } from '@lingui/macro';
import { CreateTemplateDto, TemplateInfoDto } from '@/api/Api';
import normalizeFileName from '@/utils/normalizeFileName';
import { api } from '@/api';

interface ITemplateSidebarProps {
  templateList: TemplateInfoDto[];
  currentSetTemplate: string | null;
  setCurrentTemplate: (currentTemplate: string) => void;
  createTemplate: (template: CreateTemplateDto) => void;
  refreash?: () => void;
}

const AddIcon = bundleIcon(AddFilled, AddRegular);
const ArrowSyncIcon = bundleIcon(ArrowSyncFilled, ArrowSyncRegular);
const ArrowImportIcon = bundleIcon(ArrowImport24Filled, ArrowImport24Regular);

export default function TemplateSidebar(props: ITemplateSidebarProps) {
  const fileInputRefs = useRef<HTMLInputElement>(null);
  const [createTemplateFormOpen, setCreateTemplateFormOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState(t`新的模板`);
  const [newTemplateDir, setNewTemplateDir] = useState(t`新的模板`);

  const toasterId = useId('tempalte-toaster');
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId);

  const isAllowCreate =
    newTemplateName &&
    newTemplateName.trim() !== '' &&
    newTemplateDir &&
    newTemplateDir.trim() !== '' &&
    !props.templateList.find((item) => item.dir === newTemplateDir.trim());

  function createNewTemplate() {
    if (isAllowCreate) {
      props.createTemplate({ templateName: newTemplateName, templateDir: newTemplateDir });
      setCreateTemplateFormOpen(false);
      setNewTemplateName(t`新的模板`);
      setNewTemplateDir(t`新的模板`);
    }
  }

  const notify = (intent: ToastIntent = 'success', content: string) => {
    dismissAllToasts();
    dispatchToast(
      <Toast>
        <ToastTitle>{content}</ToastTitle>
      </Toast>,
      { intent },
    );
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        const fromdata = new FormData();
        fromdata.append('file', file);
        api
          .manageTemplateControllerImportTemplate({ file: file })
          .then((res: any) => {
            if (!res.data) throw new Error();
            props.refreash?.();
            notify('success', t`模板导入成功`);
          })
          .catch(() => notify('error', t`模板导入失败，请检查是否存在重名或模板是否完整`))
          .finally(() => {
            event.target.value = '';
          });
      }
    },
    [props],
  );

  return (
    <div className={`${styles.sidebar_main}`}>
      <div className={styles.sidebar_top}>
        <span className={styles.sidebar_top_title}>{t`模板列表`}</span>
        <div className={styles.sidebar_top_buttons}>
          <div>
            <Popover
              withArrow
              trapFocus
              open={createTemplateFormOpen}
              onOpenChange={() => setCreateTemplateFormOpen(!createTemplateFormOpen)}
            >
              <PopoverTrigger>
                <Button appearance="primary" icon={<AddIcon />}>{t`新建模板`}</Button>
              </PopoverTrigger>
              <PopoverSurface>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Subtitle1>{t`创建新模板`}</Subtitle1>
                  {t`模板名称`}
                  <Input
                    value={newTemplateName}
                    onChange={(event) => {
                      setNewTemplateName(event.target.value);
                      newTemplateDir === normalizeFileName(newTemplateName) &&
                        setNewTemplateDir(normalizeFileName(event.target.value));
                    }}
                    onKeyDown={(event) => event.key === 'Enter' && createNewTemplate()}
                    defaultValue={t`新的模板`}
                    placeholder={t`模板名称`}
                  />
                  {t`模板目录`}
                  <Input
                    value={newTemplateDir}
                    onChange={(event) => setNewTemplateDir(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && createNewTemplate()}
                    defaultValue={t`新的模板`}
                    placeholder={t`模板目录`}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      appearance="primary"
                      disabled={!isAllowCreate}
                      onClick={createNewTemplate}
                    >{t`创建`}</Button>
                  </div>
                </form>
              </PopoverSurface>
            </Popover>
            <Button appearance="secondary" onClick={props.refreash} icon={<ArrowSyncIcon />} />
          </div>
          <div className={styles.sidebar_top_buttons_right_container}>
            <input
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              ref={fileInputRefs}
              onChange={(event) => handleFileChange(event)}
            />
            <Button
              appearance="subtle"
              icon={<ArrowImportIcon />}
              onClick={() => fileInputRefs.current?.click()}
            >{t`导入模板`}</Button>
          </div>
        </div>
      </div>
      <div className={styles.game_list}>
        {props.templateList.map((e) => {
          const checked = props.currentSetTemplate === e.dir;
          return (
            <TemplateElement
              onClick={() => {}}
              refreash={props.refreash}
              templateInfo={e}
              key={e.dir}
              checked={checked}
            />
          );
        })}
      </div>
      <Toaster toasterId={toasterId} />
    </div>
  );
}
