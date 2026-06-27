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
            <span className="app__mark" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="5" cy="13" r="3" className="mark-node" />
                <circle cx="21" cy="6" r="3" className="mark-node" />
                <circle cx="21" cy="20" r="3" className="mark-node" />
                <path d="M8 13 L18 6 M8 13 L18 20" className="mark-edge" />
              </svg>
            </span>
            <div>
              <h1 className="app__title">Pipeline Builder</h1>
              <p className="app__subtitle">
                Design, connect and validate workflows
              </p>
            </div>
          </div>

          <div className="app__actions">
            <StatusPill />
            <span className="app__stats">
              {animatedNodeCount} {nodeCount === 1 ? 'node' : 'nodes'} ·{' '}
              {animatedEdgeCount} {edgeCount === 1 ? 'edge' : 'edges'}
            </span>
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
