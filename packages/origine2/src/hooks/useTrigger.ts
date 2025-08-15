import { useRef, useState, useEffect, useCallback } from 'react';

export const useTrigger = (callBack: () => void, initState = true) => {
  const isInitialMount = useRef(true);
  const [isTriggered, setIsTriggered] = useState(() => initState);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      callBack();
    }
  }, [isTriggered]);
  const trigger = useCallback(() => {
    setIsTriggered(!isTriggered);
  }, [isTriggered]);
  return [trigger, isTriggered] as const;
};
