import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {useEffect} from "react";
import {setDashboardShow, setEditingGame, statusActions} from "@/store/statusReducer";
import {ITag} from "@/store/statusReducer";

export function useHashRoute() {
  const state = useSelector((state: RootState) => state.status);
  const isShowDashboard = state.dashboard.showDashBoard;
  const editingGameName = state.editor.currentEditingGame;
  const currentTag = state.editor.selectedTagTarget;
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(() => {
      // 写入 Hash
      // 如果显示 dashboard 或者两个状态都为空，则清空哈希
      if (isShowDashboard || (!editingGameName && !currentTag)) {
        window.location.hash = '';
        return;
      }
      console.log(currentTag);
      const tagInfoObj = state.editor.tags.find(e => e.tagTarget === currentTag);
      let tagStr = '';
      if (tagInfoObj) {
        tagStr = JSON.stringify(tagInfoObj);
      }
      tagStr = encodeURIComponent(tagStr);
      // 基于当前的状态构造哈希字符串，过滤掉空字符串并用 '/' 连接
      const hashParts = [editingGameName, tagStr].filter(part => part !== '');
      // 更新浏览器的哈希部分
      window.location.hash = `#/${hashParts.join('/')}`;
    }, 50);

  }, [isShowDashboard, editingGameName, currentTag]);

  useEffect(() => {
    const result = decodeHash();
    if (result.editingGameName !== '') {
      dispatch(setDashboardShow(false));
      dispatch(setEditingGame(result.editingGameName));
      if (result.currentTag !== '') {
        const currentTagJsonStr = decodeURIComponent(result.currentTag);
        let tagObj: null | ITag = null;
        try {
          tagObj = JSON.parse(currentTagJsonStr);
        } catch (e) {
        }
        if (tagObj) {
          dispatch(statusActions.addEditAreaTag(tagObj));
          dispatch(statusActions.setCurrentTagTarget(tagObj.tagTarget));
        }

      }
    }
  }, []);

}

function decodeHash() {
  // 获取当前 URL 的哈希部分
  const hash = window.location.hash;

  // 如果没有哈希，返回空
  if (!hash) {
    return {editingGameName: '', currentTag: ''};
  }

  // 移除哈希开头的 #/ ，然后分割字符串
  const parts = hash.slice(2).split('/');

  // 根据 parts 的长度返回相应的值
  if (parts.length === 0) {
    // 哈希存在但没有内容
    return {editingGameName: '', currentTag: ''};
  } else if (parts.length === 1) {
    // 只有 editingGameName
    return {editingGameName: parts[0], currentTag: ''};
  } else {
    // 有 editingGameName 和 currentTag
    return {editingGameName: parts[0], currentTag: parts[1]};
  }
}
