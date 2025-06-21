import {
  Tag,
  TagPicker,
  TagPickerInput,
  TagPickerControl,
  TagPickerGroup,
} from "@fluentui/react-components";
import { useState, ChangeEvent, KeyboardEvent } from "react";

interface ITagInputPickerProps {
  onOptionSelect: (options:string[]) => void;
  selectedOptions: string[];
}

export default function TagInputPicker({
  onOptionSelect,
  selectedOptions
}:ITagInputPickerProps){
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && inputValue) {
      setInputValue("");
      const newOptions = selectedOptions?.includes(inputValue)
        ? selectedOptions : [...selectedOptions, inputValue];
      onOptionSelect(newOptions);
    }
  };

  return <TagPicker
    noPopover
    onOptionSelect={(_,data)=>{
      onOptionSelect(data.selectedOptions);
    }}
    selectedOptions={selectedOptions}
  >
    <TagPickerControl>
      <TagPickerGroup>
        {selectedOptions.map((option) => (
          <Tag
            key={option}
            shape="rounded"
            value={option}
          >
            {option}
          </Tag>
        ))}
      </TagPickerGroup>
      <TagPickerInput
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </TagPickerControl>
  </TagPicker>;
}
