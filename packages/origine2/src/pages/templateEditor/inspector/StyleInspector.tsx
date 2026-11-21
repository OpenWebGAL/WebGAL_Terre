import { Button, Tab, TabList, Tooltip } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronUpRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import type { UiPartDescriptor, UiPseudoState } from '@webgal/editor-preview-protocol';
import type { TemplateFullCssMode, TemplateStyleTab } from '@/types/templateEditor';
import { FullCssEditor } from './FullCssEditor';
import { SimpleStyleEditor } from './SimpleStyleEditor';
import styles from './inspectorCommon.module.scss';

const PSEUDO_STATES: { key: UiPseudoState; label: () => string }[] = [
  { key: 'default', label: () => t`默认` },
  { key: 'hover', label: () => t`悬停` },
  { key: 'active', label: () => t`按下` },
  { key: 'selected', label: () => t`选中` },
  { key: 'disabled', label: () => t`禁用` },
];

interface IStyleInspectorProps {
  part: UiPartDescriptor | null;
  scssText: string;
  templateDir: string;
  scssPath: string | null;
  styleTab: TemplateStyleTab;
  fullCssMode: TemplateFullCssMode;
  lockedState: UiPseudoState;
  isCollapsed: boolean;
  onChangeStyleTab: (tab: TemplateStyleTab) => void;
  onChangeFullCssMode: (mode: TemplateFullCssMode) => void;
  onChangeLockedState: (state: UiPseudoState) => void;
  onToggleCollapse: () => void;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
  onCodeSaved: (nextScss: string) => void;
}

export function StyleInspector({
  part,
  scssText,
  templateDir,
  scssPath,
  styleTab,
  fullCssMode,
  lockedState,
  isCollapsed,
  onChangeStyleTab,
  onChangeFullCssMode,
  onChangeLockedState,
  onToggleCollapse,
  onPreviewScss,
  onCommitScss,
  onCodeSaved,
}: IStyleInspectorProps) {
  if (isCollapsed) {
    return (
      <div className={styles.collapsedBar}>
        <span>{t`外观样式`}</span>
        <Tooltip content={t`展开样式区`} relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronUpRegular />}
            onClick={onToggleCollapse}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={styles.pane} style={{ borderLeft: 'none' }}>
      <div className={styles.bar}>
        <span className={styles.barLabel}>{t`交互状态`}</span>
        <div className={styles.stateSegment}>
          {PSEUDO_STATES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.stateButton} ${lockedState === item.key ? styles.stateButtonActive : ''}`}
              onClick={() => onChangeLockedState(item.key)}
            >
              {item.label()}
            </button>
          ))}
        </div>
        <div className={styles.barSpacer} />
        <Tooltip content={t`收起样式区`} relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<ChevronDownRegular />}
            onClick={onToggleCollapse}
          />
        </Tooltip>
      </div>

      <div className={styles.tabBar}>
        <TabList
          size="small"
          selectedValue={styleTab}
          onTabSelect={(_ev, data) => onChangeStyleTab(data.value as TemplateStyleTab)}
        >
          <Tab value="simple">{t`简易模式`}</Tab>
          <Tab value="full">{t`详细模式`}</Tab>
        </TabList>
      </div>

      {styleTab === 'simple' ? (
        !part ? (
          <div className={styles.emptyState}>{t`未选择部件`}</div>
        ) : (
          <SimpleStyleEditor
            part={part}
            scssText={scssText}
            state={lockedState}
            templateDir={templateDir}
            scssPath={scssPath}
            onPreviewScss={onPreviewScss}
            onCommitScss={onCommitScss}
          />
        )
      ) : (
        <FullCssEditor
          part={part}
          scssText={scssText}
          templateDir={templateDir}
          scssPath={scssPath}
          mode={fullCssMode}
          onChangeMode={onChangeFullCssMode}
          onCommitScss={onCommitScss}
          onCodeSaved={onCodeSaved}
        />
      )}
    </div>
  );
}
