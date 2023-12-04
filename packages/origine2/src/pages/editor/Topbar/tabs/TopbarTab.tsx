import {ReactNode} from "react";
import s from './topbarTab.module.scss';

export default function TopbarTab(props:{children:ReactNode}){
  return <div className={s.tag} >{props.children}</div>;
}
