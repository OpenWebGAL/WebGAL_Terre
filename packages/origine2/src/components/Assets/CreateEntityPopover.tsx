import { useState } from 'react';
import {
  Button,
  Input,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Subtitle1,
  Tooltip,
} from '@fluentui/react-components';
import { AddFilled, AddRegular, bundleIcon } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { checkFileName } from '@/utils/checkFileName';
import styles from './Assets.module.scss';

const AddIcon = bundleIcon(AddFilled, AddRegular);

export interface ICustomCreateAction {
  title: string;
  placeholder: string;
  /** 根据输入计算当前目录下将生成的条目名（如 `ep1.txt`、`fade.json` 或角色目录名），空串表示未就绪 */
  resolveEntryName: (rawName: string) => string;
  isReservedName?: (rawName: string, subPath: string[]) => boolean;
  onCreate: (subPath: string[], rawName: string) => Promise<void>;
}

interface ICreateEntityPopoverProps {
  action: ICustomCreateAction;
  subPath: string[];
  hasEntryIgnoreCase: (entryName: string) => boolean;
  onCreated: () => void;
}

export default function CreateEntityPopover({
  action,
  subPath,
  hasEntryIgnoreCase,
  onCreated,
}: ICreateEntityPopoverProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmed = name.trim();
  const entryName = action.resolveEntryName(name);
  const isInvalidChar =
    trimmed !== '' &&
    (!checkFileName(trimmed) || trimmed === '.' || trimmed === '..' || entryName.endsWith('.'));
  const isReserved = entryName !== '' && Boolean(action.isReservedName?.(name, subPath));
  const isConflict = entryName !== '' && hasEntryIgnoreCase(entryName);

  const errorMessage = isInvalidChar
    ? `${t`文件名不可包含特殊符号`}: '/\\:*#%&?@"<>|'`
    : isReserved
      ? t`该名称为保留字，请输入其他名称`
      : isConflict
        ? t`已存在文件或文件夹 ${String(entryName)}，请输入其他名称`
        : '';

  const canCreate = entryName !== '' && !errorMessage && !submitting;

  const handleSubmit = async () => {
    if (!canCreate) return;
    setSubmitting(true);
    try {
      await action.onCreate(subPath, name);
      onCreated();
      setOpen(false);
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popover
      withArrow
      open={open}
      onOpenChange={(_, data) => {
        setOpen(data.open);
        if (!data.open) setName('');
      }}
    >
      <PopoverTrigger>
        <Tooltip content={action.title} relationship="label" positioning="below">
          <Button icon={<AddIcon />} size="small" aria-label={action.title} />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') {
            handleSubmit();
          }
        }}
      >
        <div style={{ display: 'flex', flexFlow: 'column', gap: '16px' }}>
          <Subtitle1>{action.title}</Subtitle1>
          <Tooltip
            content={{
              children: errorMessage,
              style: { color: 'var(--danger)' },
            }}
            relationship="description"
            visible={Boolean(errorMessage)}
            positioning="below"
          >
            <Input
              autoFocus
              value={name}
              placeholder={action.placeholder}
              className={errorMessage ? styles.inputDanger : ''}
              onChange={(_, data) => setName(data.value ?? '')}
            />
          </Tooltip>
          <Button appearance="primary" disabled={!canCreate} onClick={handleSubmit}>
            {t`创建`}
          </Button>
        </div>
      </PopoverSurface>
    </Popover>
  );
}
