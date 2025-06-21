import {ReactElement, ReactNode} from "react";
import styles from './commonOption.module.scss';

interface ICommonOptionProps{
  title:string,
  children:ReactNode
  row?:boolean
}

export default function CommonOptions(props:ICommonOptionProps){
  return <div className={styles.item}>
    <div className={styles.title}>{props.title}</div>
    <div className={styles.content}>{props.children}</div>
  </div>;
}
