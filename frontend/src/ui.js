// ui.js
// The drag-and-drop canvas where pipelines are assembled.

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { shallow } from 'zustand/shallow';
import { useStore } from './store';
import { nodeTypes } from './nodes/registry';
import { isConnectionValid } from './nodes/handles';
import { FlowEdge } from './components/FlowEdge';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const edgeTypes = { smoothstep: FlowEdge };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
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
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const transfer = event.dataTransfer.getData('application/reactflow');
      if (!transfer) return;

      const { nodeType: type } = JSON.parse(transfer);
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const id = getNodeID(type);
      addNode({ id, type, position, data: { id, nodeType: type } });
    },
    [reactFlowInstance, getNodeID, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Live validity feedback while dragging an edge.
  const isValidConnection = useCallback(
    (connection) => isConnectionValid(connection, useStore.getState().nodes),
    []
  );

  // A light physical tilt while a node is being dragged, applied directly to
  // the DOM (not React state) so it stays perfectly in sync with the cursor
  // without forcing a re-render on every pointer move.
  const onNodeDragStart = useCallback((event, node) => {
    const el = document.querySelector(`[data-id="${node.id}"] .node`);
    el?.classList.add('node--dragging');
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    const el = document.querySelector(`[data-id="${node.id}"] .node`);
    el?.classList.remove('node--dragging');
  }, []);

  return (
    <div className="canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        fitView
      >
        <Background color="#222a3d" gap={gridSize} size={1.5} />
        <Controls />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(8, 10, 15, 0.7)"
          nodeColor="#5560f0"
          nodeStrokeColor="#6d78ff"
          style={{ backgroundColor: '#11141d' }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="canvas__empty">
          <p>Drag a node from the left to start building your pipeline.</p>
        </div>
      )}
    </div>
  );
};
