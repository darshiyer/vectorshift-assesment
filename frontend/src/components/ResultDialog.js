// ResultDialog.js
// User-friendly presentation of the backend's pipeline analysis (or an error).

import { useEffect } from 'react';
import './ResultDialog.css';

export const ResultDialog = ({ status, result, onClose }) => {
  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isError = status === 'error';

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {isError ? (
          <>
            <h2 className="dialog__title">Couldn’t reach the backend</h2>
            <p className="dialog__message">
              {result?.message}. Make sure the API is running at the configured
              address and try again.
            </p>
          </>
        ) : (
          <>
            <h2 className="dialog__title">Pipeline analyzed</h2>

            <div className="dialog__stats">
              <div className="stat">
                <span className="stat__value">{result.num_nodes}</span>
                <span className="stat__label">Nodes</span>
              </div>
              <div className="stat">
                <span className="stat__value">{result.num_edges}</span>
                <span className="stat__label">Edges</span>
              </div>
            </div>

            <div
              className={`dialog__verdict ${
                result.is_dag ? 'is-valid' : 'is-invalid'
              }`}
            >
              {result.is_dag
                ? 'This pipeline is a valid DAG — no cycles detected.'
                : 'This pipeline is not a DAG — it contains a cycle.'}
            </div>
          </>
        )}

        <button type="button" className="btn btn--primary dialog__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
