import {useValue} from "@/hooks/useValue";
import {sentenceEditorConfig} from "@/pages/editor/GraphicalEditor/SentenceEditor";
import {commandType} from "webgal-parser/src/interface/sceneInterface";
import stylesAs from "@/pages/editor/GraphicalEditor/components/addSentence.module.scss";
import React, {useEffect, useRef, WheelEvent, WheelEventHandler} from "react";
import {Down, Up} from "@icon-park/react";

export default function AddNewSentenceLarge({onChoose}: { onChoose: (newSentence: string) => void }) {
  const isExpand = useValue(false);
  const addSentenceButtons = sentenceEditorConfig.filter(e => e.type !== commandType.comment).map(sentenceConfig => {
    return <div className={stylesAs.sentenceTypeButton} key={sentenceConfig.type} onClick={() => {
      onChoose(sentenceConfig.initialText());
    }}>
      <div style={{padding: '1px 0 0 0'}}>
        {sentenceConfig.icon}
      </div>
      <div className={stylesAs.buttonDesc}>
        <div className={stylesAs.title}>
          {sentenceConfig.title()}
        </div>
        <div className={stylesAs.text}>
          {sentenceConfig.descText()}
        </div>
      </div>
    </div>;
  });

  const buttons = useRef<HTMLDivElement>(null);

  const handleScroll = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    const deltaY = event.deltaY;
    const element = buttons.current;
    if (element) {
      const x = element.scrollLeft;
      const toX = x + deltaY;
      element.scrollTo(toX, 0);
    }
  };

  function listenWhell() {
    buttons.current?.addEventListener?.('wheel', handleScroll, {passive: false});
  }

  function stopListenWheel() {
    buttons.current?.removeEventListener?.('wheel', handleScroll);
  }

  useEffect(() => {
    if (!isExpand.value) {
      listenWhell();
      return () => {
        stopListenWheel();
      };
    }
  }, [isExpand.value]);

  const checkExpand = () => {
    isExpand.set(!isExpand.value);
  };

  return <div className={stylesAs.addNewLargeWrapper}>
    <div className={stylesAs.titleAdd}>添加新语句</div>
    <div className={stylesAs.addNewLarge} ref={buttons}
      style={{flexWrap: isExpand.value ? 'wrap' : 'nowrap'}}>
      {addSentenceButtons}
    </div>
    <div className={stylesAs.expandAllButton} key={isExpand.value.toString()} onClick={checkExpand}>
      {!isExpand.value && <>
        <Down theme="outline" size="24" fill="#005CAF" strokeWidth={3}/> 展开全部
      </>}
      {isExpand.value && <>
        <Up theme="outline" size="24" fill="#005CAF" strokeWidth={3}/> 收起全部
      </>}
    </div>
  </div>;
}
