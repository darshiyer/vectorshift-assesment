import { useState } from 'react';
import { useStore } from './store';
import { ResultDialog } from './components/ResultDialog';
import { spawnRipple } from './lib/ripple';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export const SubmitButton = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const { nodes, edges } = useStore.getState();
    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((node) => ({ id: node.id })),
          edges: edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
          })),
        }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      setResult(await response.json());
      setStatus('done');
    } catch (error) {
      setResult({ message: error.message });
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--primary"
        onClick={handleSubmit}
        onMouseDown={spawnRipple}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Pipeline'}
      </button>

      {(status === 'done' || status === 'error') && (
        <ResultDialog
          status={status}
          result={result}
          onClose={() => setStatus('idle')}
        />
      )}
    </>
  );
};
