import { ReactNode } from "react";
import s from './tagTitleWrapper.module.scss';

interface ITagTitleWrapper{
  title:string
  extra?:ReactNode
}
export default function TagTitleWrapper(props:ITagTitleWrapper){
  return <div className={s.title_wrapper}>
    <div className={s.title}>
      {props.title}
    </div>
    {props.extra&& <div className={s.extra}>{props.extra}</div>}
  </div>;
}
