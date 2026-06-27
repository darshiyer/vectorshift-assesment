// Single source of truth derived from the node configs: the ReactFlow nodeTypes
// map and the grouped list the toolbar renders. Register a node once (in
// nodeConfigs.js) and it appears everywhere automatically.

import { createNode } from '../components/BaseNode';
import { nodeConfigs } from './nodeConfigs';

export const nodeTypes = Object.fromEntries(
  nodeConfigs.map((config) => [config.type, createNode(config)])
);

const CATEGORY_LABELS = {
  io: 'Input / Output',
  llm: 'Models',
  text: 'Text',
  logic: 'Logic',
  data: 'Data',
};

const CATEGORY_ORDER = ['io', 'llm', 'text', 'logic', 'data'];

export const toolbarGroups = CATEGORY_ORDER.map((category) => ({
  category,
  label: CATEGORY_LABELS[category],
  nodes: nodeConfigs
    .filter((config) => config.category === category)
    .map(({ type, label, icon }) => ({ type, label, icon })),
})).filter((group) => group.nodes.length > 0);
