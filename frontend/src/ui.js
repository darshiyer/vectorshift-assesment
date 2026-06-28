import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const DEFAULT_NODES = [
  { id: 'input_1', type: 'input', position: { x: 30, y: 70 }, data: { name: 'user_query', type: 'Text' }, dragHandle: '.node-head' },
  { id: 'text_1', type: 'text', position: { x: 30, y: 300 }, data: { text: 'You are a concise assistant for {{user_query}}.' }, dragHandle: '.node-head' },
  { id: 'llm_1', type: 'llm', position: { x: 360, y: 150 }, data: { model: 'gpt-4o', temp: '0.7' }, dragHandle: '.node-head' },
  { id: 'output_1', type: 'output', position: { x: 720, y: 210 }, data: { name: 'answer', type: 'Text' }, dragHandle: '.node-head' },
];

const DEFAULT_EDGES = [
  { id: 'e1', source: 'input_1', sourceHandle: 'value', target: 'llm_1', targetHandle: 'prompt', type: 'animated' },
  { id: 'e2', source: 'text_1', sourceHandle: 'output', target: 'llm_1', targetHandle: 'system', type: 'animated' },
  { id: 'e3', source: 'llm_1', sourceHandle: 'response', target: 'output_1', targetHandle: 'value', type: 'animated' },
];

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      setNodes(DEFAULT_NODES);
      setEdges(DEFAULT_EDGES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView({ padding: 0.2 });
      updateZoomLabel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactFlowInstance, nodes.length]);

  const getInitNodeData = (nodeID, type) => {
    const defaults = {
      input: { name: nodeID, type: 'Text' },
      output: { name: nodeID, type: 'Text' },
      llm: { model: 'gpt-4o', temp: '0.7' },
      text: { text: 'Summarise {{input}} for the user.' },
      filter: { cond: 'score > 0.5', op: 'keep' },
      math: { op: 'add' },
      api: { method: 'GET', url: 'https://api.acme.dev/v1' },
      kb: { source: 'docs', topk: '5' },
      note: { note: 'Pin context or TODOs here.' },
    };
    return { id: nodeID, nodeType: type, ...defaults[type] };
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const appData = event.dataTransfer.getData('application/reactflow');
      if (appData) {
        const { nodeType } = JSON.parse(appData);
        if (!nodeType) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(nodeType);
        const newNode = {
          id: nodeID,
          type: nodeType,
          position,
          data: getInitNodeData(nodeID, nodeType),
          dragHandle: '.node-head',
        };
        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);


  const isEmpty = nodes.length === 0;
  const [zoomPct, setZoomPct] = useState('90%');

  const updateZoomLabel = () => {
    if (reactFlowInstance) {
      const z = Math.round(reactFlowInstance.getZoom() * 100);
      setZoomPct(z + '%');
    }
  };

  const onInit = (instance) => {
    setReactFlowInstance(instance);
    updateZoomLabel();
  };

  const zoomIn = () => {
    reactFlowInstance?.zoomIn();
    setTimeout(updateZoomLabel, 100);
  };

  const zoomOut = () => {
    reactFlowInstance?.zoomOut();
    setTimeout(updateZoomLabel, 100);
  };

  const fitView = () => {
    reactFlowInstance?.fitView({ padding: 0.2 });
    setTimeout(updateZoomLabel, 100);
  };

  return (
    <main className="canvas-wrap">
      <div className="canvas" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={onInit}
          onMove={updateZoomLabel}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={proOptions}
          snapGrid={[gridSize, gridSize]}
          connectionLineType="smoothstep"
        >
          <Background color="#6e7689" gap={gridSize} size={1} />
          <MiniMap className="react-flow-minimap" />
        </ReactFlow>
        {isEmpty && (
          <div className="empty">
            <svg className="empty-ic" viewBox="0 0 64 64" fill="none">
              <circle cx="14" cy="32" r="6" stroke="#6e7689" strokeWidth="2" />
              <circle cx="50" cy="18" r="6" stroke="#6e7689" strokeWidth="2" />
              <circle cx="50" cy="46" r="6" stroke="#6e7689" strokeWidth="2" />
              <path d="M20 32 38 20M20 32 38 44" stroke="#6e7689" strokeWidth="2" strokeDasharray="3 4" />
            </svg>
            <h3>Your canvas is empty</h3>
            <p>Drag a node from the library on the left to begin composing your pipeline.</p>
          </div>
        )}
        <div className="controls">
          <button className="ctrl-btn" onClick={zoomIn}>+</button>
          <button className="ctrl-btn" onClick={zoomOut}>−</button>
          <button className="ctrl-btn" onClick={fitView}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 5V3a1 1 0 011-1h2M12 5V3a1 1 0 00-1-1H9M2 9v2a1 1 0 001 1h2M12 9v2a1 1 0 01-1 1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <div className="ctrl-z">{zoomPct}</div>
        </div>
      </div>
    </main>
  );
};
