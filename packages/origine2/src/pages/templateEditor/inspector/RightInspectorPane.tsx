import type { UiPartDescriptor, UiPseudoState } from '@webgal/editor-preview-protocol';
import { ResizableSplit } from '@/pages/editor/AnimationEditor/components/ResizableSplit';
import type { TemplateFullCssMode, TemplateStyleTab } from '@/types/templateEditor';
import { LayoutInspector } from './LayoutInspector';
import { StyleInspector } from './StyleInspector';
import styles from './inspectorCommon.module.scss';

interface IRightInspectorPaneProps {
  isBlank?: boolean;
  part: UiPartDescriptor | null;
  scssText: string;
  templateDir: string;
  scssPath: string | null;
  styleTab: TemplateStyleTab;
  fullCssMode: TemplateFullCssMode;
  lockedState: UiPseudoState;
  isStyleCollapsed: boolean;
  onChangeStyleTab: (tab: TemplateStyleTab) => void;
  onChangeFullCssMode: (mode: TemplateFullCssMode) => void;
  onChangeLockedState: (state: UiPseudoState) => void;
  onToggleStyleCollapse: () => void;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
  onCodeSaved: (nextScss: string) => void;
}

export function RightInspectorPane({
  isBlank = false,
  part,
  scssText,
  templateDir,
  scssPath,
  styleTab,
  fullCssMode,
  lockedState,
  isStyleCollapsed,
  onChangeStyleTab,
  onChangeFullCssMode,
  onChangeLockedState,
  onToggleStyleCollapse,
  onPreviewScss,
  onCommitScss,
  onCodeSaved,
}: IRightInspectorPaneProps) {
  if (isBlank) {
    return <div className={styles.pane} />;
  }

  const layoutPane = (
    <LayoutInspector
      part={part}
      scssText={scssText}
      onPreviewScss={onPreviewScss}
      onCommitScss={onCommitScss}
    />
  );

  const stylePane = (
    <StyleInspector
      part={part}
      scssText={scssText}
      templateDir={templateDir}
      scssPath={scssPath}
      styleTab={styleTab}
      fullCssMode={fullCssMode}
      lockedState={lockedState}
      isCollapsed={isStyleCollapsed}
      onChangeStyleTab={onChangeStyleTab}
      onChangeFullCssMode={onChangeFullCssMode}
      onChangeLockedState={onChangeLockedState}
      onToggleCollapse={onToggleStyleCollapse}
      onPreviewScss={onPreviewScss}
      onCommitScss={onCommitScss}
      onCodeSaved={onCodeSaved}
    />
  );

  if (isStyleCollapsed) {
    return (
      <div className={styles.pane}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{layoutPane}</div>
        {stylePane}
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      <ResizableSplit
        direction="vertical"
        storageKey="template-editor-inspector-split"
        defaultRatio={0.34}
        first={layoutPane}
        second={stylePane}
      />
    </div>
  );
}
