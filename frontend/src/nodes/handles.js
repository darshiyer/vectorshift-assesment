// handles.js
// Shared resolution of a node's field values and handles. BaseNode (rendering),
// the validation layer, and connection checks all go through here so they can
// never disagree about what handles a node has.

import { nodeConfigs } from './nodeConfigs';

const configByType = Object.fromEntries(
  nodeConfigs.map((config) => [config.type, config])
);

export const getConfig = (type) => configByType[type];

// A default may be a static value or a function of the node id (e.g. "input_1").
const resolveDefault = (def, id) =>
  typeof def === 'function' ? def(id) : def ?? '';

export const computeValues = (config, id, data) => {
  const values = {};
  for (const field of config.fields ?? []) {
    values[field.name] = data?.[field.name] ?? resolveDefault(field.default, id);
  }
  return values;
};

// Resolve a config's handles (static list or computed from live values) and
// normalize them: every handle gets a dataType and its fully-qualified id.
export const computeHandles = (config, id, data) => {
  const values = computeValues(config, id, data);
  const raw =
    typeof config.handles === 'function'
      ? config.handles({ id, data, values })
      : config.handles ?? [];
  return raw.map((handle) => ({
    ...handle,
    dataType: handle.dataType ?? 'any',
    fullId: `${id}-${handle.id}`,
  }));
};

// Handles for a full node object ({ id, type, data }).
export const getNodeHandles = (node) => {
  const config = configByType[node.type];
  return config ? computeHandles(config, node.id, node.data) : [];
};

export const findHandle = (nodes, nodeId, handleId) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  return getNodeHandles(node).find((h) => h.fullId === handleId) ?? null;
};

// Two data types connect if they match or either side accepts anything.
export const typesCompatible = (a, b) => a === b || a === 'any' || b === 'any';

export const isConnectionValid = (connection, nodes) => {
  if (connection.source === connection.target) return false;

  const source = findHandle(nodes, connection.source, connection.sourceHandle);
  const target = findHandle(nodes, connection.target, connection.targetHandle);

  // If we can't resolve a handle, don't block the user.
  if (!source || !target) return true;
  if (source.type !== 'source' || target.type !== 'target') return false;

  return typesCompatible(source.dataType, target.dataType);
};
