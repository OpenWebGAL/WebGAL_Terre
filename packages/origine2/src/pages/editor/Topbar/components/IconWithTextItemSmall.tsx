import {ReactNode} from "react";
import s from './iconWithTextItem.module.scss';

export function IconWithTextItemSmall(props: { icon: ReactNode, text: ReactNode, onClick?: () => void }) {
  return <div onClick={()=>props?.onClick?.()} className={s.wrapperS}>
    <div className={s.iconS}>
      {props.icon}
    </div>
    <div className={s.textS}>
      {props.text}
    </div>
  </div>;
}
