import React, { ReactNode, useRef } from 'react';
import { useGameEditorContext } from '@/store/useGameEditorStore';
import styles from '../topbar.module.scss';
import s from './topbarTab.module.scss';

export default function TopbarTab(props: { children: ReactNode }) {
  const topbarTag = useRef<HTMLDivElement>(null);
  const currentTopbarTab = useGameEditorContext((state) => state.currentTopbarTab);

  const isAddSentenceActive = currentTopbarTab === 'addSentence';

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const element = topbarTag.current;
    if (!element) return;
    const x = element.scrollLeft;
    const deltaY = event.deltaY;
    const toX = x + deltaY;
    element.scrollTo(toX, 0);
  };

  const topbarTagClassName = s.tab + (isAddSentenceActive ? ' ' + styles.topbar_btn_special_active_topbar_tags : '');

  return (
    <div className={topbarTagClassName} ref={topbarTag} onWheel={handleScroll}>
      {props.children}
    </div>
  );
}
