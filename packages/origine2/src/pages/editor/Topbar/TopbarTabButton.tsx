import s from './topbar.module.scss';

export default function TopbarTabButton(props:{text:string,isActive:boolean,onClick?:()=>void}){
  return <button onClick={()=>props?.onClick?.()} className={s.topbar_btn+' '+(props.isActive?s.topbar_btn_active:'')}>
    {props.text}
  </button>;
}
