// store.js
// Central pipeline state: nodes, edges, and the actions that mutate them.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import { isConnectionValid } from './nodes/handles';

const edgeOptions = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, height: 18, width: 18 },
};

export const useStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeIDs: {},

      // Monotonic, per-type id generator: "text-1", "text-2", ...
      getNodeID: (type) => {
        const nodeIDs = { ...get().nodeIDs };
        nodeIDs[type] = (nodeIDs[type] ?? 0) + 1;
        set({ nodeIDs });
        return `${type}-${nodeIDs[type]}`;
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      removeNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      },

      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },

      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },

      onConnect: (connection) => {
        // Enforce self-loop, direction and data-type rules.
        if (!isConnectionValid(connection, get().nodes)) return;
        // A target handle takes a single input: replace any existing edge into it.
        const edges = get().edges.filter(
          (edge) =>
            !(
              edge.target === connection.target &&
              edge.targetHandle === connection.targetHandle
            )
        );
        set({ edges: addEdge({ ...connection, ...edgeOptions }, edges) });
      },

      // Immutable field update — the original mutated node.data in place, which
      // breaks React's referential-equality checks and can skip re-renders.
      updateNodeField: (nodeId, fieldName, fieldValue) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
              : node
          ),
        });
      },

      clearPipeline: () => set({ nodes: [], edges: [], nodeIDs: {} }),
    }),
    {
      name: 'vectorshift-pipeline',
      // Persist only serializable graph state, not the action functions.
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      }),
    }
  )
);
