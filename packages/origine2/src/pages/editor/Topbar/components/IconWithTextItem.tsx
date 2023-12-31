import {ReactNode} from "react";
import s from './iconWithTextItem.module.scss';

export function IconWithTextItem(props: { icon: ReactNode, text: ReactNode, onClick?: () => void }) {
  return <div onClick={()=>props?.onClick?.()} className={s.wrapper}>
    <div className={s.icon}>
      {props.icon}
    </div>
    <div className={s.text}>
      {props.text}
    </div>
  </div>;
}
