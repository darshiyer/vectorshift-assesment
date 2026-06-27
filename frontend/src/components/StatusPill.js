// StatusPill.js
// Live pipeline health in the header, driven by the shared validation context.

import { useValidation } from '../lib/ValidationContext';
import './StatusPill.css';

export const StatusPill = () => {
  const validation = useValidation();
  if (!validation) return null;

  const { errorCount, warningCount } = validation;

  const state = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'valid';

  const label =
    state === 'error'
      ? `${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`
      : state === 'warning'
      ? `${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'}`
      : 'Valid pipeline';

  return (
    <span className={`status-pill status-pill--${state}`} title="Live pipeline validation">
      <span className="status-pill__dot" />
      {label}
    </span>
  );
};
