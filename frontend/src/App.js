import { shallow } from 'zustand/shallow';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { useStore } from './store';
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

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo">VS</span>
          <div>
            <h1 className="app__title">Pipeline Builder</h1>
            <p className="app__subtitle">Design, connect and validate workflows</p>
          </div>
        </div>

        <div className="app__actions">
          <span className="app__stats">
            {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'} · {edgeCount}{' '}
            {edgeCount === 1 ? 'edge' : 'edges'}
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={clearPipeline}
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
  );
}

export default App;
