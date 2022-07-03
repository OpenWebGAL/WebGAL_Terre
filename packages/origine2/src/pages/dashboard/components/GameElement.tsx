import styles from "./gameElement.module.scss";

interface IGameElementProps {
  gameName: string;
  checked: boolean;
  onClick:Function;
}

export default function GameElement(props: IGameElementProps) {

  let className = styles.gameElement_main;
  if(props.checked){
    className = className + ' '+styles.gameElement_checked;
  }

  // @ts-ignore
  return <div onClick={props.onClick} className={className}>
    {props.gameName}
  </div>;
};
