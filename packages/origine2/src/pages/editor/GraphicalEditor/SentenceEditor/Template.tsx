import { ISentenceEditorProps } from "./index";

export default function Template(props:ISentenceEditorProps){
  return <div>{props.sentence.content}</div>;
}
