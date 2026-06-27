import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { getConfig } from '../nodes/handles';
import { CATEGORY_COLORS } from '../nodes/registry';
import './ResultDialog.css';

const nodeMeta = (nodes, id) => {
  const node = nodes.find((n) => n.id === id);
  const config = node && getConfig(node.type);
  return {
    label: config?.label ?? '',
    color: config ? CATEGORY_COLORS[config.category] : 'var(--brand-500)',
  };
};

export const ResultDialog = ({ status, result, onClose }) => {
  const nodes = useStore((state) => state.nodes);

  // Close on Escape for keyboard users.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isError = status === 'error';
  const ok = !isError && result.is_dag && result.num_nodes > 0;

  return createPortal(
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__top">
          <button type="button" className="dialog__x" onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M3 3l7 7M10 3l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          <div className="dialog__verdict">
            <div className={`dialog__verdict-icon ${isError ? 'is-bad' : ok ? 'is-ok' : 'is-bad'}`}>
              {!isError && ok ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>
            <div className="dialog__verdict-text">
              <b>{isError ? 'Couldn’t reach the backend' : ok ? 'Valid pipeline' : 'Invalid pipeline'}</b>
              <span>
                {isError
                  ? `${result?.message}. Check that the API is running.`
                  : ok
                  ? 'This graph is a directed acyclic graph — ready to run.'
                  : result.num_nodes === 0
                  ? 'Add at least one node to run.'
                  : 'A cycle was detected — pipelines must be acyclic.'}
              </span>
            </div>
          </div>
        </div>

        {!isError && (
          <>
            <div className="dialog__stats">
              <div className="dialog__stat">
                <b>{result.num_nodes}</b>
                <span>Nodes</span>
              </div>
              <div className="dialog__stat">
                <b>{result.num_edges}</b>
                <span>Edges</span>
              </div>
            </div>

            <div className="dialog__order">
              <div className="dialog__order-h">{ok ? 'Execution order' : 'Issue'}</div>
              {ok ? (
                <div className="dialog__order-list">
                  {result.execution_order.map((id, i) => {
                    const meta = nodeMeta(nodes, id);
                    return (
                      <div
                        className="dialog__order-row"
                        key={id}
                        style={{ animationDelay: `${i * 45}ms` }}
                      >
                        <div className="dialog__order-n">{i + 1}</div>
                        <div className="dialog__order-id">{id}</div>
                        <div className="dialog__order-cat" style={{ '--cat': meta.color }}>
                          {meta.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="dialog__order-bad">
                  {result.cycle_nodes?.length
                    ? `Nodes in cycle: ${result.cycle_nodes.join(' → ')}. Remove a connecting edge to break the loop.`
                    : 'Drag a node onto the canvas, then connect and submit.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
