import {ReactNode} from "react";
import styles from './optionCategory.module.scss';

interface IOptionCategoryProps {
    title: string;
    children: ReactNode,
    column?:boolean,
}

export function OptionCategory(props: IOptionCategoryProps) {
  return <div className={styles.item}>
    <div className={styles.title}>{props.title}</div>
    <div className={props.column ? styles.contentColumn : styles.contentRow}>
      {props.children}
    </div>
  </div>;
}