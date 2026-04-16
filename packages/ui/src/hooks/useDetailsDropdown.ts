import { useRef, useCallback } from "react";
import { useClickOutside } from "./useClickOutside";

/**
 * Custom hook to manage DaisyUI dropdowns that use the <details> element.
 * It provides a ref to attach to the details element and a close function,
 * automatically closing the dropdown when a click outside occurs.
 */
export function useDetailsDropdown() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = useCallback(() => {
    if (detailsRef.current) {
      detailsRef.current.removeAttribute("open");
    }
  }, []);

  // Use the extracted hook to handle outside clicks automatically
  useClickOutside(detailsRef, closeDropdown);

  return { detailsRef, closeDropdown };
}
