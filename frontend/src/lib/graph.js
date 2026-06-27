// graph.js
// Pure graph helpers shared by the live validator. Kahn's algorithm gives us a
// topological order and, for free, the set of nodes left in a cycle.

export const topologicalAnalysis = (nodeIds, edges) => {
  const ids = new Set(nodeIds);
  const indegree = new Map(nodeIds.map((id) => [id, 0]));
  const adjacency = new Map(nodeIds.map((id) => [id, []]));

  for (const edge of edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) {
      adjacency.get(edge.source).push(edge.target);
      indegree.set(edge.target, indegree.get(edge.target) + 1);
    }
  }

  const queue = nodeIds.filter((id) => indegree.get(id) === 0);
  const order = [];

  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const next of adjacency.get(id)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }

  const ordered = new Set(order);
  const cycleNodes = new Set(nodeIds.filter((id) => !ordered.has(id)));

  return { isDag: cycleNodes.size === 0, order, cycleNodes };
};
