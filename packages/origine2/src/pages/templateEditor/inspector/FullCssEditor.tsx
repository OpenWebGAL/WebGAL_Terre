import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@lingui/macro';
import type { UiPartDescriptor } from '@webgal/editor-preview-protocol';
import type { TemplateFullCssMode } from '@/types/templateEditor';
import type {
  IWebgalCssProp,
  IWebgalPropsWithState,
} from '../TemplateGraphicalEditor/utils/extractCss';
import TextEditor from '../TextEditor/TextEditor';
import WebgalClassEditor from '../TemplateGraphicalEditor/WebgalClassEditor';
import WithStateEditor from '../TemplateGraphicalEditor/withStateEditor';
import {
  parsePartRawDeclarations,
  replacePartRawDeclarations,
  type PartRawRuleMap,
} from '../styleModel';
import styles from './inspectorCommon.module.scss';

interface IFullCssEditorProps {
  part: UiPartDescriptor | null;
  scssText: string;
  templateDir: string;
  scssPath: string | null;
  mode: TemplateFullCssMode;
  onChangeMode: (mode: TemplateFullCssMode) => void;
  onCommitScss: (nextScss: string) => void;
  onCodeSaved: (nextScss: string) => void;
}

function recordToProps(record: Record<string, string>): IWebgalCssProp[] {
  return Object.entries(record).map(([propName, propValue]) => ({ propName, propValue }));
}

function propsToRecord(list: IWebgalCssProp[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of list) {
    const key = item.propName.trim();
    if (key) {
      result[key] = item.propValue ?? '';
    }
  }
  return result;
}

export function FullCssEditor({
  part,
  scssText,
  templateDir,
  scssPath,
  mode,
  onChangeMode,
  onCommitScss,
  onCodeSaved,
}: IFullCssEditorProps) {
  const [remountSeq, setRemountSeq] = useState(0);
  const lastSubmittedScssRef = useRef<string | null>(null);

  useEffect(() => {
    if (scssText !== lastSubmittedScssRef.current) {
      setRemountSeq((seq) => seq + 1);
    }
    lastSubmittedScssRef.current = null;
  }, [scssText, part?.selector]);

  const parsed = useMemo(() => {
    if (!part) return null;
    const raw = parsePartRawDeclarations(scssText, part.selector, part.stateHostSelector);
    const props = recordToProps(raw.default);
    const propWithState: IWebgalPropsWithState[] = (['hover', 'active', 'selected', 'disabled'] as const)
      .map((state) => ({
        state,
        props: recordToProps(raw[state]),
      }));
    return { props, propWithState };
  }, [part, scssText]);

  const handleGraphicalSubmit = useCallback(() => {
    if (!part || !parsed) return;
    const stateMap: Record<string, IWebgalCssProp[]> = {};
    for (const group of parsed.propWithState) {
      stateMap[group.state] = group.props;
    }
    const nextRuleMap: PartRawRuleMap = {
      default: propsToRecord(parsed.props),
      hover: propsToRecord(stateMap.hover ?? []),
      active: propsToRecord(stateMap.active ?? []),
      selected: propsToRecord(stateMap.selected ?? []),
      disabled: propsToRecord(stateMap.disabled ?? []),
    };
    const nextScss = replacePartRawDeclarations(
      scssText,
      { selector: part.selector, stateHostSelector: part.stateHostSelector },
      nextRuleMap,
    );
    lastSubmittedScssRef.current = nextScss;
    onCommitScss(nextScss);
  }, [part, parsed, scssText, onCommitScss]);

  const editorPath = scssPath ? `templates/${templateDir}/${scssPath}` : null;

  return (
    <div className={styles.fullBody}>
      <div className={styles.bar}>
        <div className={styles.stateSegment}>
          <button
            type="button"
            className={`${styles.stateButton} ${mode === 'graphical' ? styles.stateButtonActive : ''}`}
            onClick={() => onChangeMode('graphical')}
          >
            {t`图形`}
          </button>
          <button
            type="button"
            className={`${styles.stateButton} ${mode === 'code' ? styles.stateButtonActive : ''}`}
            onClick={() => onChangeMode('code')}
          >
            {t`代码`}
          </button>
        </div>
      </div>

      {mode === 'graphical' ? (
        !part || !parsed ? (
          <div className={styles.emptyState}>{t`未选择部件`}</div>
        ) : (
          <div className={styles.graphicalScroll} key={`${part.selector}-${remountSeq}`}>
            <WebgalClassEditor props={parsed.props} onSubmit={handleGraphicalSubmit} />
            <WithStateEditor propWithState={parsed.propWithState} onSubmit={handleGraphicalSubmit} />
          </div>
        )
      ) : editorPath ? (
        <div className={styles.codeWrapper}>
          <TextEditor path={editorPath} fallbackText={scssText} onSaved={onCodeSaved} />
        </div>
      ) : (
        <div className={styles.emptyState}>{t`未找到样式文件`}</div>
      )}
    </div>
  );
}
