import { useEffect, useRef, useCallback } from 'react';
import { Dropdown, Option, DropdownProps } from "@fluentui/react-components";

interface WheelDropdownProps extends DropdownProps {
  options: Map<string, string>;
  value: string;
  onValueChange: (newValue: string | undefined) => void;
}

export default function WheelDropdown({ options, value, onValueChange, ...restProps }: WheelDropdownProps) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const optionKeys = Array.from(options.keys());

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const currentIndex = optionKeys.indexOf(value);
      let direction = 0;

      // 判断滚动方向：向下滚动为 1，向上滚动为 -1，滚动停止为 0
      if (event.deltaY > 0) {
        direction = 1;
      } else if (event.deltaY < 0) {
        direction = -1;
      }

      const newIndex = currentIndex === -1
        ? 0
        : (currentIndex + direction + options.size) % options.size;

      const newTarget = optionKeys[newIndex];
      onValueChange(newTarget);
    },
    [value, onValueChange, options.size, optionKeys]
  );

  useEffect(() => {
    const dropdownElement = dropdownRef.current;
    if (dropdownElement) {
      dropdownElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (dropdownElement) {
        dropdownElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

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
