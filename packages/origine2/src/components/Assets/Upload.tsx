import styles from './Upload.module.scss';

import { ChangeEventHandler, useState } from 'react';
import { classNames } from 'primereact/utils';
import { bundleIcon, ArrowUpload32Filled, ArrowUpload32Regular, Delete20Regular, Delete20Filled } from "@fluentui/react-icons";
import {t} from '@lingui/macro';
import { List } from '@fluentui/react';
import { getFileIcon } from '@/utils/getFileIcon';

export type IUploadProps = {
  name?: string;
  className?: string;
  title?: string;
  multiple?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

const ArrowUploadIcon = bundleIcon(ArrowUpload32Filled, ArrowUpload32Regular);
const ClosedCaptionIcon = bundleIcon(Delete20Filled, Delete20Regular);
const getFiles = (fileList?: FileList|null) => {
  if (!fileList) return [];

  const files = [];
  for (const file of fileList) {
    files.push(file.name)
  }
  return files;
}

export default function Upload({ name, className, title, multiple, onChange }: IUploadProps) {
  const [files, setFiles] = useState<string[]>([]);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (ev) => {
    setFiles(getFiles(ev.target.files))
    onChange?.(ev);
  };

  return <div className={classNames(styles.upload, className)}>
    <div className={styles['upload-box']}>
      <ArrowUploadIcon />
      <div>{t`点击或拖拽文件至此上传`}</div>
      <input className={styles['upload-input']} name={name} type="file" title={title} multiple={multiple} onChange={onChangeHandler} />
    </div>
    <List items={files} onRenderCell={(file) => <div className={styles['upload-file']}>
        <img src={getFileIcon(file!)} alt="icon" />
        <span>{file}</span>
    </div>}/>
  </div>;
}