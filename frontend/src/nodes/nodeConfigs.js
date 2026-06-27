// Every node type, expressed as data. This is the payoff of the BaseNode
// abstraction: a new node is a config object here, nothing more.

import { parseVariables } from './parseVariables';

// --- The four original node types, re-expressed as configs ----------------

const inputNode = {
  type: 'customInput',
  label: 'Input',
  category: 'io',
  icon: '⤵',
  fields: [
    {
      name: 'inputName',
      label: 'Name',
      type: 'text',
      default: (id) => id.replace('customInput-', 'input_'),
    },
    {
      name: 'inputType',
      label: 'Type',
      type: 'select',
      options: ['Text', 'File'],
      default: 'Text',
    },
  ],
  handles: [{ id: 'value', type: 'source', dataType: 'any' }],
};

const outputNode = {
  type: 'customOutput',
  label: 'Output',
  category: 'io',
  icon: '⤴',
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      default: (id) => id.replace('customOutput-', 'output_'),
    },
    {
      name: 'outputType',
      label: 'Type',
      type: 'select',
      options: ['Text', 'Image'],
      default: 'Text',
    },
  ],
  handles: [{ id: 'value', type: 'target', dataType: 'any' }],
};

const llmNode = {
  type: 'llm',
  label: 'LLM',
  category: 'llm',
  icon: '✦',
  description: 'Runs a prompt through a language model.',
  handles: [
    { id: 'system', type: 'target', label: 'system', dataType: 'text' },
    { id: 'prompt', type: 'target', label: 'prompt', dataType: 'text' },
    { id: 'response', type: 'source', label: 'response', dataType: 'text' },
  ],
};

const textNode = {
  type: 'text',
  label: 'Text',
  category: 'text',
  icon: '𝐓',
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'textarea',
      suggest: true,
      default: '{{ input }}',
      placeholder: 'Write text, reference variables with {{ name }}',
    },
  ],
  // Variables typed as {{ name }} become input handles on the left.
  handles: ({ values }) => [
    ...parseVariables(values.text).map((name) => ({
      id: `var-${name}`,
      type: 'target',
      label: name,
      dataType: 'text',
    })),
    { id: 'output', type: 'source', dataType: 'text' },
  ],
};

// --- Five new nodes, added with config alone -------------------------------

const filterNode = {
  type: 'filter',
  label: 'Filter',
  category: 'logic',
  icon: '⛃',
  fields: [
    {
      name: 'condition',
      label: 'Keep when',
      type: 'text',
      default: '',
      placeholder: 'e.g. score > 0.5',
    },
  ],
  handles: [
    { id: 'input', type: 'target', label: 'in', dataType: 'any' },
    { id: 'kept', type: 'source', label: 'kept', dataType: 'any' },
    { id: 'dropped', type: 'source', label: 'dropped', dataType: 'any' },
  ],
};

const mathNode = {
  type: 'math',
  label: 'Math',
  category: 'logic',
  icon: '∑',
  fields: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      options: ['Add', 'Subtract', 'Multiply', 'Divide'],
      default: 'Add',
    },
  ],
  handles: [
    { id: 'a', type: 'target', label: 'a', dataType: 'number' },
    { id: 'b', type: 'target', label: 'b', dataType: 'number' },
    { id: 'result', type: 'source', label: '=', dataType: 'number' },
  ],
};

const apiNode = {
  type: 'api',
  label: 'API Request',
  category: 'data',
  icon: '☍',
  fields: [
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
    },
    {
      name: 'url',
      label: 'Endpoint',
      type: 'text',
      default: '',
      placeholder: 'https://api.example.com/v1',
    },
  ],
  handles: [
    { id: 'body', type: 'target', label: 'body', dataType: 'any' },
    { id: 'response', type: 'source', label: 'response', dataType: 'any' },
  ],
};

const knowledgeBaseNode = {
  type: 'knowledgeBase',
  label: 'Knowledge Base',
  category: 'data',
  icon: '◫',
  description: 'Semantic search over an indexed source.',
  fields: [
    {
      name: 'source',
      label: 'Source',
      type: 'select',
      options: ['Documents', 'Website', 'Database'],
      default: 'Documents',
    },
    {
      name: 'topK',
      label: 'Top K',
      type: 'number',
      default: '3',
    },
  ],
  handles: [
    { id: 'query', type: 'target', label: 'query', dataType: 'text' },
    { id: 'results', type: 'source', label: 'results', dataType: 'any' },
  ],
};

const noteNode = {
  type: 'note',
  label: 'Note',
  category: 'text',
  icon: '✎',
  fields: [
    {
      name: 'note',
      label: '',
      type: 'textarea',
      default: '',
      placeholder: 'Leave a note on the canvas…',
    },
  ],
  // A documentation node — no handles at all, which the abstraction handles fine.
  handles: [],
};

export const nodeConfigs = [
  inputNode,
  outputNode,
  llmNode,
  textNode,
  filterNode,
  mathNode,
  apiNode,
  knowledgeBaseNode,
  noteNode,
];
