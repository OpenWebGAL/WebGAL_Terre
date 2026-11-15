import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { t } from '@lingui/macro';
import type { UiPartDescriptor } from '@webgal/editor-preview-protocol';
import {
  applyPartLayoutPatch,
  parsePartLayout,
  type LayoutFields,
} from '../styleModel';
import { InspectorRow, PxSpinField } from './SimpleFieldHelpers';
import styles from './inspectorCommon.module.scss';

interface ILayoutInspectorProps {
  part: UiPartDescriptor | null;
  scssText: string;
  onPreviewScss: (nextScss: string) => void;
  onCommitScss: (nextScss: string) => void;
}

export function LayoutInspector({
  part,
  scssText,
  onPreviewScss,
  onCommitScss,
}: ILayoutInspectorProps) {
  const layout = useMemo(
    () => (part ? parsePartLayout(scssText, part.selector) : {}),
    [part, scssText],
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

  const updateField = useCallback(
    (patch: Partial<LayoutFields>) => {
      if (!part) return;
      const nextScss = applyPartLayoutPatch(latestScssRef.current, part.selector, patch);
      latestScssRef.current = nextScss;
      onPreviewScss(nextScss);
      debouncedCommit(nextScss);
    },
    [part, onPreviewScss, debouncedCommit],
  );

  if (!part) {
    return <div className={styles.emptyState}>{t`未选择部件`}</div>;
  }

  return (
    <div className={styles.scrollBody}>
      {part.allowLayoutEdit && (
        <>
          <InspectorRow label={t`位置`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag="X"
                value={layout.left}
                placeholder={part.box ? String(Math.round(part.box.x)) : '0'}
                onChange={(left) => updateField({ left })}
              />
              <PxSpinField
                tag="Y"
                value={layout.top}
                placeholder={part.box ? String(Math.round(part.box.y)) : '0'}
                onChange={(top) => updateField({ top })}
              />
            </div>
            <span className={styles.unitTag}>px</span>
          </InspectorRow>
          <InspectorRow label={t`尺寸`}>
            <div className={styles.pairGroup}>
              <PxSpinField
                tag="W"
                min={0}
                value={layout.width}
                placeholder={part.box ? String(Math.round(part.box.width)) : '0'}
                onChange={(width) => updateField({ width })}
              />
              <PxSpinField
                tag="H"
                min={0}
                value={layout.height}
                placeholder={part.box ? String(Math.round(part.box.height)) : '0'}
                onChange={(height) => updateField({ height })}
              />
            </div>
            <span className={styles.unitTag}>px</span>
          </InspectorRow>
        </>
      )}

      <InspectorRow label={t`内边距`}>
        <div className={styles.quadGroup}>
          <PxSpinField
            min={0}
            value={layout.paddingTop}
            placeholder="0"
            onChange={(paddingTop) => updateField({ paddingTop })}
          />
          <PxSpinField
            min={0}
            value={layout.paddingRight}
            placeholder="0"
            onChange={(paddingRight) => updateField({ paddingRight })}
          />
          <PxSpinField
            min={0}
            value={layout.paddingBottom}
            placeholder="0"
            onChange={(paddingBottom) => updateField({ paddingBottom })}
          />
          <PxSpinField
            min={0}
            value={layout.paddingLeft}
            placeholder="0"
            onChange={(paddingLeft) => updateField({ paddingLeft })}
          />
        </div>
        <span className={styles.unitTag}>px</span>
      </InspectorRow>

      <InspectorRow label={t`外边距`}>
        <div className={styles.quadGroup}>
          <PxSpinField
            value={layout.marginTop}
            placeholder="0"
            onChange={(marginTop) => updateField({ marginTop })}
          />
          <PxSpinField
            value={layout.marginRight}
            placeholder="0"
            onChange={(marginRight) => updateField({ marginRight })}
          />
          <PxSpinField
            value={layout.marginBottom}
            placeholder="0"
            onChange={(marginBottom) => updateField({ marginBottom })}
          />
          <PxSpinField
            value={layout.marginLeft}
            placeholder="0"
            onChange={(marginLeft) => updateField({ marginLeft })}
          />
        </div>
        <span className={styles.unitTag}>px</span>
      </InspectorRow>
    </div>
  );
}
