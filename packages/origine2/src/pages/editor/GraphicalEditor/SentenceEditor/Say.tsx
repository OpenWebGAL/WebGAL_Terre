import { TextField } from "@fluentui/react";
import { ISentenceEditorProps } from "./index";
import { useValue } from "../../../../hooks/useValue";

export default function Say(props: ISentenceEditorProps) {
  const currentValue = useValue(props.sentence.content);
  return <div><TextField value={currentValue.value}
    onChange={(ev, newValue) => {
      currentValue.set(newValue??'');
    }}
    onBlur={()=>props.onSubmit(currentValue.value)}
  /></div>;
}
