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
        // Reject self-connections; ReactFlow already de-dupes identical handles.
        if (connection.source === connection.target) return;
        set({ edges: addEdge({ ...connection, ...edgeOptions }, get().edges) });
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
