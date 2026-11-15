import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import {
  applyPartSimpleStylePatch,
  parsePartSimpleStyle,
  type PseudoState,
  type SimpleStyleModel,
} from '../styleModel';
import { SimpleBackgroundSection } from './SimpleBackgroundSection';
import { SimpleBorderSection } from './SimpleBorderSection';
import { SimpleTextSection } from './SimpleTextSection';
import styles from './inspectorCommon.module.scss';

interface ISimpleStyleEditorProps {
  scssText: string;
  selector: string;
  state: PseudoState;
  templateDir: string;
  scssPath?: string | null;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
}

export function SimpleStyleEditor({
  scssText,
  selector,
  state,
  templateDir,
  scssPath,
  onPreviewScss,
  onCommitScss,
}: ISimpleStyleEditorProps) {
  const model = useMemo(
    () => parsePartSimpleStyle(scssText, selector, state),
    [scssText, selector, state],
  );

  const latestScssRef = useRef(scssText);
  latestScssRef.current = scssText;

  const commitRef = useRef(onCommitScss);
  commitRef.current = onCommitScss;

  const debouncedCommit = useMemo(
    () => debounce((next: string) => commitRef.current(next), 220),
    [],
  );

  useEffect(() => () => debouncedCommit.cancel(), [debouncedCommit]);

  const handlePatch = useCallback(
    <K extends keyof SimpleStyleModel>(
      group: K,
      value: SimpleStyleModel[K],
      immediateCommit = false,
    ) => {
      const nextScss = applyPartSimpleStylePatch(
        latestScssRef.current,
        selector,
        state,
        group,
        value,
      );
      latestScssRef.current = nextScss;
      onPreviewScss(nextScss);
      if (immediateCommit) {
        debouncedCommit.cancel();
        commitRef.current(nextScss);
      } else {
        debouncedCommit(nextScss);
      }
    },
    [selector, state, onPreviewScss, debouncedCommit],
  );

  return (
    <div className={styles.scrollBody}>
      <SimpleTextSection model={model} onPatch={handlePatch} />
      <SimpleBackgroundSection
        model={model}
        templateDir={templateDir}
        scssPath={scssPath}
        onPatch={handlePatch}
      />
      <SimpleBorderSection model={model} onPatch={handlePatch} />
    </div>
  );
}
