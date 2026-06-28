import { Topbar } from './submit';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';

function App() {
  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <PipelineToolbar />
        <PipelineUI />
      </div>
    </div>
  );
}

export default App;
