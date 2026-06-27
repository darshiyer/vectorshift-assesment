// BaseNode.js
// The single node primitive every node type is built on. A node is described by
// a plain config object (title, icon, fields, handles); BaseNode turns that
// config into a rendered ReactFlow node. New node types are pure data — see
// nodes/nodeConfigs.js — so there is no per-node boilerplate to copy.

import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { NodeField } from './NodeField';
import './BaseNode.css';

// A default may be a static value or a function of the node id (e.g. "input_1").
const resolveDefault = (def, id) =>
  typeof def === 'function' ? def(id) : def ?? '';

// Spread handles evenly down a side: 1 handle -> 50%, 2 -> 33%/66%, etc.
const offsetFor = (index, total) => `${((index + 1) / (total + 1)) * 100}%`;

export const BaseNode = ({ id, data, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const removeNode = useStore((state) => state.removeNode);

  const fields = config.fields ?? [];

  // Current value of every field, falling back to its configured default.
  const values = {};
  for (const field of fields) {
    values[field.name] = data?.[field.name] ?? resolveDefault(field.default, id);
  }

  // Handles can be a static list or derived from the node's live values
  // (the Text node uses this to grow handles from {{ variables }}).
  const handles =
    typeof config.handles === 'function'
      ? config.handles({ id, data, values })
      : config.handles ?? [];

  const targets = handles.filter((h) => h.type === 'target');
  const sources = handles.filter((h) => h.type === 'source');

  const renderHandles = (list, position) =>
    list.map((handle, index) => (
      <Handle
        key={handle.id}
        type={handle.type}
        position={position}
        id={`${id}-${handle.id}`}
        style={{ top: offsetFor(index, list.length) }}
      >
        {handle.label && (
          <span
            className={`handle-label handle-label--${
              position === Position.Left ? 'left' : 'right'
            }`}
          >
            {handle.label}
          </span>
        )}
      </Handle>
    ));

  return (
    <div className="node" data-category={config.category}>
      {renderHandles(targets, Position.Left)}

      <header className="node__header">
        <span className="node__icon" aria-hidden="true">
          {config.icon}
        </span>
        <span className="node__title">{config.label}</span>
        <button
          type="button"
          className="node__remove"
          title="Delete node"
          onClick={() => removeNode(id)}
        >
          ×
        </button>
      </header>

      {config.description && (
        <p className="node__description">{config.description}</p>
      )}

      {fields.length > 0 && (
        <div className="node__body">
          {fields.map((field) => (
            <NodeField
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={(value) => updateNodeField(id, field.name, value)}
            />
          ))}
        </div>
      )}

      {/* Allow a config to inject custom UI without abandoning the abstraction. */}
      {config.render?.({ id, data, values })}

      {renderHandles(sources, Position.Right)}
    </div>
  );
};

// Factory: turn a config into the component ReactFlow registers per node type.
export const createNode = (config) => {
  const NodeComponent = (props) => <BaseNode {...props} config={config} />;
  NodeComponent.displayName = `${config.label}Node`;
  return NodeComponent;
};
