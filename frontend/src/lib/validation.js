// Turns the raw graph into human-readable pipeline issues: cycles, unconnected
// outputs, and unused inputs. This is the same analysis the backend performs,
// run live on the client so the user gets feedback while building.

import { topologicalAnalysis } from './graph';

export const validatePipeline = (nodes, edges) => {
  const nodeIds = nodes.map((node) => node.id);
  const { isDag, order, cycleNodes } = topologicalAnalysis(nodeIds, edges);

  const issuesByNode = new Map();
  const addIssue = (id, level, message) => {
    if (!issuesByNode.has(id)) issuesByNode.set(id, []);
    issuesByNode.get(id).push({ level, message });
  };

  for (const id of cycleNodes) addIssue(id, 'error', 'Part of a cycle');

  const incoming = new Map(nodeIds.map((id) => [id, 0]));
  const outgoing = new Map(nodeIds.map((id) => [id, 0]));
  for (const edge of edges) {
    if (incoming.has(edge.target))
      incoming.set(edge.target, incoming.get(edge.target) + 1);
    if (outgoing.has(edge.source))
      outgoing.set(edge.source, outgoing.get(edge.source) + 1);
  }

  for (const node of nodes) {
    if (node.type === 'customOutput' && incoming.get(node.id) === 0) {
      addIssue(node.id, 'warning', 'Output is not connected');
    }
    if (node.type === 'customInput' && outgoing.get(node.id) === 0) {
      addIssue(node.id, 'warning', 'Input is not used');
    }
  }

  const issues = [...issuesByNode.entries()].flatMap(([nodeId, list]) =>
    list.map((issue) => ({ nodeId, ...issue }))
  );

  return {
    isDag,
    order,
    cycleNodes,
    issuesByNode,
    issues,
    errorCount: issues.filter((i) => i.level === 'error').length,
    warningCount: issues.filter((i) => i.level === 'warning').length,
  };
};
