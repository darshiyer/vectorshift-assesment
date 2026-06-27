// Computes pipeline validation once from the store and shares it with the header
// status pill and every node, so the analysis runs a single time per change.

import { createContext, useContext, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import { validatePipeline } from './validation';

const ValidationContext = createContext(null);

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

export const ValidationProvider = ({ children }) => {
  const { nodes, edges } = useStore(selector, shallow);
  const validation = useMemo(
    () => validatePipeline(nodes, edges),
    [nodes, edges]
  );

  return (
    <ValidationContext.Provider value={validation}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidation = () => useContext(ValidationContext);

export const useNodeIssues = (nodeId) => {
  const validation = useContext(ValidationContext);
  return validation?.issuesByNode.get(nodeId) ?? [];
};
