import { useEffect, RefObject } from "react";

/**
 * Hook that alerts clicks outside of the passed ref.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: (event: MouseEvent) => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Allow execution if we clicked outside the element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
