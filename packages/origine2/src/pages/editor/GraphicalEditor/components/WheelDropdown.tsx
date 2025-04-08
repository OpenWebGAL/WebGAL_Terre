import { useEffect, useRef, useCallback, useState } from 'react';
import { Dropdown, Option, DropdownProps } from "@fluentui/react-components";
import debounce from 'lodash/debounce';

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
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const debouncedOnValueChange = useCallback(
    debounce(onValueChange, 500),
    [onValueChange]
  );

  // 处理焦点状态
  useEffect(() => {
    const dropdownElement = dropdownRef.current;
    if (!dropdownElement) return;

    const handleFocusIn = () => setIsFocusWithin(true);
    const handleFocusOut = (e: FocusEvent) => {
      // 当焦点转移目标不在容器内时才更新状态
      if (!dropdownElement.contains(e.relatedTarget as Node)) {
        setIsFocusWithin(false);
      }
    };

    dropdownElement.addEventListener('focusin', handleFocusIn);
    dropdownElement.addEventListener('focusout', handleFocusOut);

    return () => {
      dropdownElement.removeEventListener('focusin', handleFocusIn);
      dropdownElement.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // 滚动处理
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!isFocusWithin) return; // 非焦点状态下无效

      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      event.preventDefault();
      event.stopPropagation();

      const currentIndex = optionKeys.indexOf(internalValue);
      const newIndex = (currentIndex + direction + options.size) % options.size;
      const newTarget = optionKeys[newIndex];

      setInternalValue(newTarget);
      debouncedOnValueChange(newTarget);
    },
    [optionKeys, options.size, internalValue, debouncedOnValueChange, isFocusWithin]
  );

  // 滚动事件监听
  useEffect(() => {
    const dropdownElement = dropdownRef.current;
    if (!dropdownElement) return;

    dropdownElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => dropdownElement.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // 同步外部值变化
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <Dropdown
      ref={dropdownRef}
      value={options.get(internalValue) ?? internalValue}
      selectedOptions={[internalValue]}
      onOptionSelect={(_, data) => onValueChange(data.optionValue)}
      style={{ minWidth: 0 }}
      {...restProps}
    >
      {Array.from(options.entries()).map(([key, text]) => (
        <Option key={key} value={key}>{text}</Option>
      ))}
    </Dropdown>
  );
};
