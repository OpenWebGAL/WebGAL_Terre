import { useState } from 'react';

const holdMap = new Map();

export function useValue<T>(initialState: T): {
  _value: T;
  set: (newValue: T) => void;
  value: T;
};
export function useValue<T>(
  initialState: T,
  isHold: boolean,
  key: string,
): {
  _value: T;
  set: (newValue: T) => void;
  value: T;
};
export function useValue<T>(initialState: T, isHold?: boolean, key?: string) {
  const holdKey = key ?? '__value_hold_key__';
  let fromHoldValue;
  if (isHold) {
    fromHoldValue = holdMap.get(holdKey);
  }
  const [value, setValue] = useState<T>(fromHoldValue ?? initialState);
  return {
    _value: value,
    set: function (newValue: T) {
      this._value = newValue;
      if (isHold) {
        holdMap.set(holdKey, newValue);
      }
      setValue(newValue);
    },
    get value() {
      if (isHold) {
        const result = holdMap.get(holdKey);
        if (result) {
          return result as T;
        }
      }
      return this._value;
    },
    set value(newValue) {
      this.set(newValue);
    },
  };
}
