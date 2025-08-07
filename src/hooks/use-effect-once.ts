
"use client";

import { useEffect, useRef } from 'react';

// A hook that runs an effect only once on mount, in a strict-mode compatible way.
export const useEffectOnce = (effect: () => void | (() => void)) => {
  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      const cleanup = effect();
      effectRan.current = true;
      
      // The return function from useEffect is used for cleanup.
      // We only want to return the cleanup function if the original effect provided one.
      return () => {
        if (cleanup) {
          cleanup();
        }
      };
    }
    // We have an empty dependency array to ensure this runs only on mount.
    // The eslint-disable comment is to silence the warning about the missing `effect` dependency,
    // which is intentional for a "run once" hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
