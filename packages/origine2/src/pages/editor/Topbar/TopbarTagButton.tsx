import s from './topbar.module.scss';

export default function TopbarTagButton(props:{text:string,isActive:boolean}){
  return <button className={s.topbar_btn+' '+(props.isActive?s.topbar_btn_active:'')}>
    {props.text}
  </button>;
}
