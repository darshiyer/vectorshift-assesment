// The single node primitive every node type is built on. A node is described by
// a plain config object (title, icon, fields, handles); BaseNode turns that
// config into a rendered ReactFlow node. New node types are pure data — see
// nodes/nodeConfigs.js — so there is no per-node boilerplate to copy.

import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { computeValues, computeHandles } from '../nodes/handles';
import { useNodeIssues } from '../lib/ValidationContext';
import { NodeField } from './NodeField';
import './BaseNode.css';

// Spread handles evenly down a side: 1 handle -> 50%, 2 -> 33%/66%, etc.
const offsetFor = (index, total) => `${((index + 1) / (total + 1)) * 100}%`;

export const BaseNode = ({ id, data, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const removeNode = useStore((state) => state.removeNode);
  const issues = useNodeIssues(id);

  const fields = config.fields ?? [];

  // Current value of every field, falling back to its configured default.
  const values = computeValues(config, id, data);

  // Handles can be a static list or derived from the node's live values
  // (the Text node uses this to grow handles from {{ variables }}).
  const handles = computeHandles(config, id, data);

  const targets = handles.filter((h) => h.type === 'target');
  const sources = handles.filter((h) => h.type === 'source');

  const topIssue =
    issues.find((i) => i.level === 'error') ?? issues.find((i) => i.level === 'warning');

  // Bare connection points — their names are listed in the ports grid inside
  // the card, matching the design's "ports panel" rather than floating labels.
  const renderHandles = (list, position) =>
    list.map((handle, index) => (
      <Handle
        key={handle.id}
        type={handle.type}
        position={position}
        id={`${id}-${handle.id}`}
        style={{ top: offsetFor(index, list.length) }}
      />
    ));

  return (
    <div
      className="node"
      data-category={config.category}
      data-status={topIssue?.level}
    >
      {renderHandles(targets, Position.Left)}

      <header className="node__header">
        <span className="node__icon" aria-hidden="true">
          {config.icon}
        </span>
        <span className="node__title">{config.label}</span>
        <span className="node__id">{id}</span>
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

      <div className="node__body">
        {(targets.length > 0 || sources.length > 0) && (
          <div className="node__ports">
            <div className="node__port-col">
              {targets.map((handle) => (
                <div className="node__port-row" key={handle.id}>
                  <span className="node__port-dot" />
                  {handle.label ?? handle.id}
                </div>
              ))}
            </div>
            <div className="node__port-col node__port-col--right">
              {sources.map((handle) => (
                <div className="node__port-row" key={handle.id}>
                  {handle.label ?? handle.id}
                  <span className="node__port-dot" />
                </div>
              ))}
            </div>
          </div>
        )}

        {fields.map((field) => (
          <NodeField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value) => updateNodeField(id, field.name, value)}
          />
        ))}
      </div>

      {/* Allow a config to inject custom UI without abandoning the abstraction. */}
      {config.render?.({ id, data, values })}

      {topIssue && (
        <div className={`node__issue node__issue--${topIssue.level}`}>
          <span className="node__issue-dot" />
          {topIssue.message}
        </div>
      )}

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
