import { shallow } from 'zustand/shallow';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { StatusPill } from './components/StatusPill';
import { ValidationProvider } from './lib/ValidationContext';
import { useStore } from './store';
import { useCountUp } from './lib/useCountUp';
import { spawnRipple } from './lib/ripple';
import './App.css';

const statsSelector = (state) => ({
  nodeCount: state.nodes.length,
  edgeCount: state.edges.length,
  clearPipeline: state.clearPipeline,
});

function App() {
  const { nodeCount, edgeCount, clearPipeline } = useStore(
    statsSelector,
    shallow
  );
  const animatedNodeCount = useCountUp(nodeCount);
  const animatedEdgeCount = useCountUp(edgeCount);

  return (
    <ValidationProvider>
      <div className="app">
        <header className="app__header">
          <div className="app__brand">
            <svg className="app__mark" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="34" y2="34">
                  <stop offset="0" stopColor="#22d3ee" />
                  <stop offset="0.55" stopColor="#7c83ff" />
                  <stop offset="1" stopColor="#b07cff" />
                </linearGradient>
              </defs>
              <path
                className="app__mark-link"
                d="M9 9 L25 17 M25 17 L9 25"
                stroke="url(#brandGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3 4"
              />
              <circle className="app__mark-node" cx="9" cy="9" r="4.4" fill="url(#brandGradient)" />
              <circle
                className="app__mark-node app__mark-node--2"
                cx="25"
                cy="17"
                r="4.4"
                fill="url(#brandGradient)"
              />
              <circle
                className="app__mark-node app__mark-node--3"
                cx="9"
                cy="25"
                r="4.4"
                fill="url(#brandGradient)"
              />
            </svg>
            <div>
              <h1 className="app__title">Pipeline Studio</h1>
              <p className="app__subtitle">Node orchestration</p>
            </div>
          </div>

          <div className="app__center">
            <StatusPill />
            <div className="app__counters">
              <div className="app__counter">
                <b>{animatedNodeCount}</b>
                <span>nodes</span>
              </div>
              <div className="app__counter">
                <b>{animatedEdgeCount}</b>
                <span>edges</span>
              </div>
            </div>
          </div>

          <div className="app__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={clearPipeline}
              onMouseDown={spawnRipple}
              disabled={nodeCount === 0}
            >
              Clear
            </button>
            <SubmitButton />
          </div>
        </header>

        <div className="app__body">
          <PipelineToolbar />
          <PipelineUI />
        </div>
      </div>
    </ValidationProvider>
  );
}

export default App;
