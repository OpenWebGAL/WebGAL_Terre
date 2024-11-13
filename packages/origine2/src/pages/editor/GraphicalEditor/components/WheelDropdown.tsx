import { useEffect, useRef, useCallback } from 'react';
import { Dropdown, Option, DropdownProps } from "@fluentui/react-components";
import {debounce} from '@/utils/debounce';

interface WheelDropdownProps extends DropdownProps {
  options: Map<string, string>;
  value: string;
  onValueChange: (newValue: string | undefined) => void;
}

export default function WheelDropdown({ options, value, onValueChange, ...restProps }: WheelDropdownProps) {
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const optionKeys = Array.from(options.keys());
  const scrollDirectionRef = useRef(0); // 累计滚动方向

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // 判断滚动方向：向下滚动为 1，向上滚动为 -1
      const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      scrollDirectionRef.current += direction; // 累加滚动方向
      debouncedHandleWheel();
    },
    [options]
  );

  const debouncedHandleWheel = useCallback(
    debounce(() => {
      const accumulatedDirection = scrollDirectionRef.current;
      if (accumulatedDirection !== 0) {
        const currentIndex = optionKeys.indexOf(value);
        const newIndex = (currentIndex + accumulatedDirection + options.size) % options.size;
        const newTarget = optionKeys[newIndex];

        onValueChange(newTarget);
        scrollDirectionRef.current = 0; // 重置累加方向
      }
    }, 250),
    [optionKeys, options.size, value, onValueChange]
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
