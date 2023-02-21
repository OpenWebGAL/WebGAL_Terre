import { ISentenceEditorProps } from "./index";

export default function Say(props:ISentenceEditorProps){
  return <div>Say{props.sentence.content}</div>;
}
