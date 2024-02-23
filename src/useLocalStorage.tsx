import { useEffect, useState } from "react";

export function useLocalStorage(initialValue: any, key: any) {
  const [value, setValue] = useState<any>(() => {
    const value = localStorage.getItem(key);
    console.log(value, "==========vlaue");
    return value ? JSON.parse(value) : initialValue;
  });
  useEffect(() => {
    console.log(localStorage, "localStorage");
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);
  return [value, setValue];
}
