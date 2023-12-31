import s from './topbar.module.scss';

export default function TopbarTabButtonSpecial(props:{text:string,isActive:boolean,onClick?:()=>void}){
  return <button onClick={()=>props?.onClick?.()} className={s.topbar_btn_special+' '+(props.isActive?s.topbar_btn_special_active:'')}>
    <div className={s.specialText}>
      {props.text}
    </div>

  </button>;
}
