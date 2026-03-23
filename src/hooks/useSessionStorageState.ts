import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

type StorageOptions<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
};

function getInitialValue<T>(key: string, initialValue: T, deserialize: (value: string) => T) {
  if (typeof window === 'undefined') {
    return initialValue;
  }

  try {
    const storedValue = window.sessionStorage.getItem(key);
    return storedValue === null ? initialValue : deserialize(storedValue);
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return initialValue;
  }
}

export function useSessionStorageState<T>(
  key: string,
  initialValue: T,
  options: StorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const serialize = useMemo(() => options.serialize ?? JSON.stringify, [options.serialize]);
  const deserialize = useMemo(
    () => options.deserialize ?? ((value: string) => JSON.parse(value) as T),
    [options.deserialize]
  );

  const [state, setState] = useState<T>(() => getInitialValue(key, initialValue, deserialize));

  useEffect(() => {
    setState(getInitialValue(key, initialValue, deserialize));
  }, [deserialize, initialValue, key]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (state === initialValue) {
        window.sessionStorage.removeItem(key);
        return;
      }

      window.sessionStorage.setItem(key, serialize(state));
    } catch (error) {
      console.error(`Error writing sessionStorage key "${key}":`, error);
    }
  }, [initialValue, key, serialize, state]);

  return [state, setState];
}
