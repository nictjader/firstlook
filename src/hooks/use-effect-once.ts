
"use client";

import { useEffect, useRef, useState } from 'react';

// A hook that runs an effect only once on mount, in a strict-mode compatible way.
export const useEffectOnce = (effect: () => void | (() => void)) => {
  const effectFn = useRef(effect);
  const destroyFn = useRef<void | (() => void)>();
  const effectCalled = useRef(false);
  const rendered = useRef(false);
  const [, setVal] = useState(0);

  if (effectCalled.current) {
    rendered.current = true;
  }

  useEffect(() => {
    // Only execute the effect first time around
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current();
      effectCalled.current = true;
    }

    // This forces one render after the effect is run
    setVal((val) => val + 1);

    return () => {
      // If the component is unmounted, tear down the effect
      if (rendered.current === false) {
        if (destroyFn.current) {
          destroyFn.current();
        }
      }
    };
  }, []);
};
