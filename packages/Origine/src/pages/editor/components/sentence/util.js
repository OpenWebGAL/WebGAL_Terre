import runtime from "../../../../env/runtime";
import store from "../../store/editorStore";

const deleteThis = (index) => {
    runtime.currentSceneSentenceList.splice(index, 1);
    store.set('writeScene', !store.get('writeScene'));
}

const changePos = (index, diff) => {
    if ((index === 0 && diff === -1) || (index === runtime.currentSceneSentenceList.length - 1 && diff === 1)) {
        //什么也不做
        return;
    } else {
        //先把index位置的语句提出来
        const tempSentence = runtime.currentSceneSentenceList[index];
        //然后将这个语句删除
        runtime.currentSceneSentenceList.splice(index, 1);
        //然后在指定位置插入这个语句
        runtime.currentSceneSentenceList.splice(index + diff, 0, tempSentence);
    }
    //更新编辑器
    store.set('writeScene', !store.get('writeScene'));
}

export {deleteThis, changePos};
