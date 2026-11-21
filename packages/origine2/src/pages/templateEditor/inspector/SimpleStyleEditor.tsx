import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import type { UiPartDescriptor } from '@webgal/editor-preview-protocol';
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
  part: UiPartDescriptor;
  scssText: string;
  state: PseudoState;
  templateDir: string;
  scssPath?: string | null;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
}

export function SimpleStyleEditor({
  part,
  scssText,
  state,
  templateDir,
  scssPath,
  onPreviewScss,
  onCommitScss,
}: ISimpleStyleEditorProps) {
  const { selector, stateHostSelector, kind } = part;
  const model = useMemo(
    () => parsePartSimpleStyle(scssText, { selector, state, stateHostSelector }),
    [scssText, selector, state, stateHostSelector],
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
      const nextScss = applyPartSimpleStylePatch({
        scssText: latestScssRef.current,
        selector,
        state,
        stateHostSelector,
        group,
        value,
      });
      latestScssRef.current = nextScss;
      onPreviewScss(nextScss);
      if (immediateCommit) {
        debouncedCommit.cancel();
        commitRef.current(nextScss);
      } else {
        debouncedCommit(nextScss);
      }
    },
    [selector, state, stateHostSelector, onPreviewScss, debouncedCommit],
  );

  const showText = !kind || kind === 'text';
  const showContainer = !kind || kind === 'container';

  return (
    <div className={styles.scrollBody}>
      {showText && <SimpleTextSection model={model} onPatch={handlePatch} />}
      {showContainer && (
        <>
          <SimpleBackgroundSection
            model={model}
            templateDir={templateDir}
            scssPath={scssPath}
            onPatch={handlePatch}
          />
          <SimpleBorderSection model={model} onPatch={handlePatch} />
        </>
      )}
    </div>
  );
}
