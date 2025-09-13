import { useEffect, useRef } from "react";

interface UseDebouncedSaveOptions {
  delay?: number;
  enabled?: boolean;
}

/**
 * Debounces a save function until after a delay has passed without changes.
 *
 * @param saveFn - async or sync function to run when dependencies change
 * @param deps - list of dependencies to watch
 * @param options - debounce delay and toggle
 */
export function useDebouncedSave(
  saveFn: () => void | Promise<void>,
  deps: unknown[],
  { delay = 1000, enabled = true }: UseDebouncedSaveOptions = {},
) {
  const fnRef = useRef(saveFn);
  fnRef.current = saveFn; // always latest reference

  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(() => {
      fnRef.current();
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
