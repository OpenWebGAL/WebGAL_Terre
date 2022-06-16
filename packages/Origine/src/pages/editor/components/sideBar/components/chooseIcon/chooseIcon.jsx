import runtime from "../../../../../../env/runtime";
import styles from "../../sideBar.module.scss";
import store from "../../../../store/editorStore";

export function ChooseIcon(props){
    return <div
         className={props.e === runtime.editorTag ? styles.tagButton + ' ' + styles.tagButtonOn : styles.tagButton}
         onClick={props.onClickFunc}>
        <div>
            {props.icon}<span style={{margin: '0 5px 0 0 '}}/>
        </div>
    </div>
}
