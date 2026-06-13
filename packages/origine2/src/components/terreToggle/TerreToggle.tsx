import { Dropdown, Option } from "@fluentui/react-components";

interface ITerreToggle{
  title:string,
  onChange:(newValue:boolean)=>void,
  onText:string,
  offText:string,
  isChecked:boolean
}

export default function TerreToggle(props:ITerreToggle){
  const value = props.isChecked ? "true" : "false";
  return (
    <Dropdown
      value={props.isChecked ? props.onText : props.offText}
      selectedOptions={[value]}
      onOptionSelect={(_, data) => data.optionValue && props.onChange(data.optionValue === "true")}
      style={{ minWidth: "140px" }}
    >
      <Option value="true">{props.onText}</Option>
      <Option value="false">{props.offText}</Option>
    </Dropdown>
  );
}
