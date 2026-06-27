import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ResultDialog.css';

export const ResultDialog = ({ status, result, onClose }) => {
  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isError = status === 'error';

  return createPortal(
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

            {result.is_dag && result.execution_order?.length > 0 && (
              <div className="dialog__section">
                <span className="dialog__section-title">Execution order</span>
                <div className="dialog__chips">
                  {result.execution_order.map((id, i) => (
                    <span key={id} className="chip">
                      <span className="chip__index">{i + 1}</span>
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!result.is_dag && result.cycle_nodes?.length > 0 && (
              <div className="dialog__section">
                <span className="dialog__section-title">Nodes in the cycle</span>
                <div className="dialog__chips">
                  {result.cycle_nodes.map((id) => (
                    <span key={id} className="chip chip--danger">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <button type="button" className="btn btn--primary dialog__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};
