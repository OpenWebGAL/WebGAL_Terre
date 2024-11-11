import { useEffect, useRef } from 'react';
import { Dropdown, Option, DropdownProps } from "@fluentui/react-components";

interface WheelDropdownProps extends DropdownProps {
  options: Map<string, string>;
  value: string;
  onValueChange: (newValue: string | undefined) => void;
}

export default function WheelDropdown({ options, value, onValueChange, ...restProps }: WheelDropdownProps) {
  const dropdownRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const currentIndex = Array.from(options.keys()).indexOf(value);

      let newIndex = currentIndex;
      if (currentIndex === -1) {
        newIndex = 0;
      } else if (event.deltaY > 0) {
        newIndex = (currentIndex + 1) % options.size;
      } else if (event.deltaY < 0) {
        newIndex = (currentIndex - 1 + options.size) % options.size;
      }

      const newTarget = Array.from(options.keys())[newIndex];
      onValueChange(newTarget);
    };

    const dropdownElement = dropdownRef.current;
    if (dropdownElement) {
      dropdownElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (dropdownElement) {
        dropdownElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [value, options, onValueChange]);

  return (
    <Dropdown
      ref={dropdownRef}
      value={options.get(value) ?? value}
      selectedOptions={[value]}
      onOptionSelect={(event, data) => {
        onValueChange(data.optionValue);
      }}
      style={{ minWidth: 0 }}
      {...restProps}
    >
      {Array.from(options.entries()).map(([key, text]) => (
        <Option key={key} value={key}>
          {text}
        </Option>
      ))}
    </Dropdown>
  );
};
