import { memo, ReactNode, useState } from 'react';
import { Button, Dropdown, Option, Switch } from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { InfoTip } from '../components/InfoTip';
import { isInherit, isRelative } from '../model/animationSettings';
import { FigurePosition, IPreviewSettings, PreviewTarget } from '../preview/previewSettings';
import { FileSetting } from './FileSetting';
import { InitialStateDrawer } from './InitialStateDrawer';
import styles from './animationSettingsPanel.module.scss';

interface IAnimationSettingsPanelProps {
  fields: Record<string, unknown>;
  updateFields: (update: (fields: Record<string, unknown>) => Record<string, unknown>) => void;
  preview: IPreviewSettings;
  onPreviewChange: (patch: Partial<IPreviewSettings>) => void;
}

/**
 * 与时间轴无关的设置：上半部分写入动画文件，下半部分只用于预览。
 * 预览初始状态在抽屉中编辑，开启时自动打开
 */
// 播放时每帧都会重新渲染编辑器，这里的内容与播放头无关，用 memo 跳过
export const AnimationSettingsPanel = memo(SettingsPanel);

function SettingsPanel(props: IAnimationSettingsPanelProps) {
  const { fields, updateFields, preview, onPreviewChange } = props;
  const targetLabels: Record<PreviewTarget, string> = { figure: t`立绘`, background: t`背景` };
  const positionLabels: Record<FigurePosition, string> = { left: t`左`, center: t`中`, right: t`右` };
  const [isInitialStateDrawerOpen, setIsInitialStateDrawerOpen] = useState(false);

  return (
    <div className={styles.panel}>
      <Section title={t`动画`}>
        <SettingRow
          label={t`相对动画`}
          info={t`开启时，关键帧中的值基于对象当前的状态计算，例如位置、旋转为相加，缩放为相乘；关闭时均为绝对值。可在属性的菜单中修改计算方式。`}
        >
          <Switch
            checked={isRelative(fields)}
            onChange={(_, data) => updateFields((prev) => ({ ...prev, relative: data.checked }))}
          />
        </SettingRow>
        <SettingRow
          label={t`帧继承`}
          info={t`开启时，每个属性只在自己的关键帧之间过渡；关闭时，关键帧中没有设置的属性会回到对象当前的状态。`}
        >
          <Switch
            checked={isInherit(fields)}
            onChange={(_, data) => updateFields((prev) => ({ ...prev, inherit: data.checked }))}
          />
        </SettingRow>
      </Section>
      <Section title={t`预览`} info={t`仅用于预览，不会写入动画文件`}>
        <SettingRow label={t`预览对象`}>
          <Dropdown
            className={styles.dropdown}
            size="small"
            value={targetLabels[preview.target]}
            selectedOptions={[preview.target]}
            onOptionSelect={(_, data) => onPreviewChange({ target: data.optionValue as PreviewTarget })}
          >
            {Object.entries(targetLabels).map(([value, label]) => <Option key={value} value={value}>{label}</Option>)}
          </Dropdown>
        </SettingRow>
        <SettingRow label={t`立绘`}>
          <FileSetting basePath="figure" file={preview.figure} onChange={(figure) => onPreviewChange({ figure })} />
        </SettingRow>
        <SettingRow label={t`立绘位置`}>
          <Dropdown
            className={styles.dropdown}
            size="small"
            value={positionLabels[preview.figurePosition]}
            selectedOptions={[preview.figurePosition]}
            onOptionSelect={(_, data) => onPreviewChange({ figurePosition: data.optionValue as FigurePosition })}
          >
            {Object.entries(positionLabels).map(([value, label]) => <Option key={value} value={value}>{label}</Option>)}
          </Dropdown>
        </SettingRow>
        <SettingRow label={t`背景`}>
          <FileSetting
            basePath="background"
            file={preview.background}
            onChange={(background) => onPreviewChange({ background })}
          />
        </SettingRow>
        <SettingRow label={t`设置预览初始状态`} info={t`设置预览对象在动画开始前的状态，相对动画以此为基准`}>
          <Switch
            checked={preview.isInitialStateEnabled}
            onChange={(_, data) => {
              onPreviewChange({ isInitialStateEnabled: data.checked });
              setIsInitialStateDrawerOpen(data.checked);
            }}
          />
          {preview.isInitialStateEnabled && (
            <Button size="small" onClick={() => setIsInitialStateDrawerOpen(true)}>
              {t`编辑`}
            </Button>
          )}
        </SettingRow>
      </Section>
      <InitialStateDrawer
        open={isInitialStateDrawerOpen}
        onOpenChange={setIsInitialStateDrawerOpen}
        json={preview.initialTransform}
        onChange={(initialTransform) => onPreviewChange({ initialTransform })}
      />
    </div>
  );
}

function Section({ title, info, children }: { title: string; info?: string; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {title}
        {info && <InfoTip content={info} />}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, info, children }: { label: string; info?: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>
        {label}
        {info && <InfoTip content={info} />}
      </div>
      <div className={styles.control}>{children}</div>
    </div>
  );
}
