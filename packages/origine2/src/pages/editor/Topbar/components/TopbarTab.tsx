import React, {ReactNode, useRef} from "react";
import s from './topbarTab.module.scss';

export default function TopbarTab(props:{children:ReactNode}){

  const topbarTag = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const deltaY = event.deltaY;
    // console.log(`滚动距离：${deltaY}px`);
    const element = topbarTag.current;
    if(element){
      const x = element.scrollLeft;
      const toX = x + deltaY;
      element.scrollTo(toX,0);
    }
  };

  return <div className={s.tab} ref={topbarTag} onWheel={handleScroll}>{props.children}</div>;
}
