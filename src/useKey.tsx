import { useEffect } from "react";

export function useKey(key: string, action: any) {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key == key) {
        action();
      }
    }
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);
}
