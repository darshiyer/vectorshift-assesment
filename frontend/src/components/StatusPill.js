// StatusPill.js
// Live pipeline health in the header, driven by the shared validation context.
// Bursts a brief glow ring the moment the pipeline transitions into "valid".

import { useEffect, useRef, useState } from 'react';
import { useValidation } from '../lib/ValidationContext';
import './StatusPill.css';

export const StatusPill = () => {
  const validation = useValidation();
  const previousState = useRef(null);
  const [justValidated, setJustValidated] = useState(false);

  const { errorCount = 0, warningCount = 0 } = validation ?? {};
  const state = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'valid';

  useEffect(() => {
    if (!validation) return;
    const wasInvalid = previousState.current && previousState.current !== 'valid';
    previousState.current = state;

    if (state === 'valid' && wasInvalid) {
      setJustValidated(true);
      const timer = setTimeout(() => setJustValidated(false), 650);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!validation) return null;

  const label =
    state === 'error'
      ? `${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`
      : state === 'warning'
      ? `${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}`
      : 'Valid pipeline';

  return (
    <span
      className={`status-pill status-pill--${state} ${justValidated ? 'just-validated' : ''}`}
      title="Live pipeline validation"
    >
      <span className="status-pill__dot" />
      {label}
    </span>
  );
};
