import { Switch, Tooltip } from "@fluentui/react-components";

interface ITerreToggle{
  title:string,
  onChange:(newValue:boolean)=>void,
  onText:string,
  offText:string,
  isChecked:boolean
}

export default function TerreToggle(props:ITerreToggle){
  return (
    <Tooltip content={props.onText} relationship="label" positioning="below">
      <Switch checked={props.isChecked} onChange={(_, data) => props.onChange(data.checked)} />
    </Tooltip>
  );
}
