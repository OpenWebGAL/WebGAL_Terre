import {ReactNode} from "react";
import s from './topbarTag.module.scss';

export default function TopbarTag(props:{children:ReactNode}){
  return <div className={s.tag} >{props.children}</div>;
}
