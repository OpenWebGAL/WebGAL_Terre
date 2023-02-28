import { Toggle } from "@fluentui/react";

interface ITerreToggle{
  title:string,
  onChange:(newValue:boolean)=>void,
  onText:string,
  offText:string,
  isChecked:boolean
}

export default function TerreToggle(props:ITerreToggle){
  return <Toggle styles={{ root: { margin: "0 0 0 0" } }}
    checked={props.isChecked}
    label={props.title} inlineLabel onText={props.onText} offText={props.offText}
    onChange={(event, checked) => props.onChange(checked ?? false)} />;
}
