import { Switch, Tooltip } from "@fluentui/react-components";

interface ITerreToggle{
  title:string,
  onChange:(newValue:boolean)=>void,
  onText:string,
  offText:string,
  isChecked:boolean
}

export default function TerreToggle(props:ITerreToggle){
  const text = props.isChecked ? props.onText : props.offText;
  return (
    <Tooltip content={text} relationship="label" positioning="below">
      <Switch checked={props.isChecked} onChange={(_, data) => props.onChange(data.checked)} />
    </Tooltip>
  );
}
