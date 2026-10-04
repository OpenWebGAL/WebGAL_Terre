import { Button } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import ChooseFile from '@/pages/editor/ChooseFile/ChooseFile';
import { extNameMap } from '@/pages/editor/ChooseFile/chooseFileConfig';
import { AssetPreview } from '@/pages/editor/GraphicalEditor/components/AssetPreview';
import styles from './animationSettingsPanel.module.scss';

interface IFileSettingProps {
  basePath: 'figure' | 'background';
  /** 相对于 basePath 的文件名，空字符串表示未选择 */
  file: string;
  onChange: (file: string) => void;
}

const EXT_NAMES = {
  figure: [...(extNameMap.get('image') ?? []), ...(extNameMap.get('json') ?? [])],
  background: [...(extNameMap.get('image') ?? []), ...(extNameMap.get('video') ?? [])],
};

/**
 * 选择预览用的素材文件：缩略图、文件名、选择按钮，选择后可以清除
 */
export function FileSetting({ basePath, file, onChange }: IFileSettingProps) {
  return (
    <div className={styles.file}>
      <AssetPreview basePath={basePath} file={file} />
      <span className={styles.fileName} title={file}>{file || t`无`}</span>
      {file && (
        <Button size="small" appearance="subtle" icon={<DismissRegular />} title={t`清除`} onClick={() => onChange('')} />
      )}
      <ChooseFile
        basePath={[basePath]}
        selectedFilePath={file}
        extNames={EXT_NAMES[basePath]}
        onChange={(chosenFile) => onChange(chosenFile?.name ?? '')}
      />
    </div>
  );
}
