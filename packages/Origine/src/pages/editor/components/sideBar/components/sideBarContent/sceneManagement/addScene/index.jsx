import axios from "axios";
import runtime from "../../../../../../../../env/runtime";
import styles from './addScene.module.scss'

const AddScene = (props) => {

    const add = () => {
        const data = {gameName: runtime.currentEditGame, sceneName: document.getElementById('addSceneName').value}
        axios.post(`${runtime.domain}/api/editGame/addNewScene/`, data).then(r => {
            props.added();
        }).catch(e => {
            console.log(e)
        })
    }

    return <div className={styles.main}>
        <div className={styles.title}>
            场景名称<input className={styles.addInput} id={'addSceneName'}/>
        </div>
        <div className={styles.addButton} onClick={add}>新建场景</div>
    </div>
}

export default AddScene;
