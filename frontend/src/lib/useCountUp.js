// useCountUp.js
// Animates a number tweening toward `value` instead of snapping, so the header
// stats feel alive when nodes/edges are added or removed.

import { useEffect, useRef, useState } from 'react';

export const useCountUp = (value, durationMs = 280) => {
  const [display, setDisplay] = useState(value);
  const frame = useRef(null);

  useEffect(() => {
    const from = display;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
};
