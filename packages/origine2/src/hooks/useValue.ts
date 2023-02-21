import { useState } from "react";

export function useValue<T>(initialState: T) {
  const [value, setValue] = useState<T>(initialState);
  return {
    value,
    set: function(newValue: T) {
      this.value = newValue;
      setValue(newValue);
    }
  };
}
