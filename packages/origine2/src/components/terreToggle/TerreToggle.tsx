import { Switch } from "@fluentui/react-components";

interface ITerreToggle{
  title:string,
  onChange:(newValue:boolean)=>void,
  onText:string,
  offText:string,
  isChecked:boolean
}

export default function TerreToggle(props:ITerreToggle){
  return (
    <div style={{display: 'flex', alignItems: 'center', flexWrap: 'nowrap'}}>
      <Switch
        checked={props.isChecked}
        onChange={(event, data) => props.onChange(data.checked ?? false)}
      />
      {props.isChecked ? props.onText : props.offText}
    </div>
  );
}
