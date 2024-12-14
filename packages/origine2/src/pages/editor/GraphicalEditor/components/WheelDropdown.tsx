import { useEffect, useRef, useCallback, useState } from 'react';
import { Dropdown, Option, DropdownProps } from "@fluentui/react-components";
import { debounce } from '@/utils/debounce';

interface WheelDropdownProps extends DropdownProps {
  options: Map<string, string>;
  value: string;
  onValueChange: (newValue: string | undefined) => void;
}

export default function WheelDropdown({
  options,
  value,
  onValueChange,
  ...restProps
}: WheelDropdownProps) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const optionKeys = Array.from(options.keys());

  const [internalValue, setInternalValue] = useState(value);

  const debouncedOnValueChange = useCallback(
    debounce(onValueChange, 500),
    [onValueChange]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // TODO 这个特性容易误触
      // 判断滚动方向：向下滚动为 1，向上滚动为 -1
      const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (direction !== 0) {
        const currentIndex = optionKeys.indexOf(internalValue);
        const newIndex = (currentIndex + direction + options.size) % options.size;
        const newTarget = optionKeys[newIndex];

        setInternalValue(newTarget);
        debouncedOnValueChange(newTarget);
      }
    },
    [optionKeys, options.size, internalValue, debouncedOnValueChange]
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

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <Dropdown
      ref={dropdownRef}
      value={options.get(internalValue) ?? internalValue}
      selectedOptions={[internalValue]}
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
