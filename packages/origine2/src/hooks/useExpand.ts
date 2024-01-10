import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store/origineStore";
import {updateGraphicalEditorCurrentExpandSentence} from "@/store/statusReducer";

export function useExpand() {
  const currentExpandSentence = useSelector((state: RootState) => state.status.editor.graphicalEditorState.currentExpandSentence);
  const dispatch = useDispatch();
  const updateIndex = (index:number)=>dispatch(updateGraphicalEditorCurrentExpandSentence(index));
  return {expandIndex:currentExpandSentence,updateExpandIndex:updateIndex};
}
