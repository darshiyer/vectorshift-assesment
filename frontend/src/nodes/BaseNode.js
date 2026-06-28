import React from 'react';
import { Handle, Position } from 'reactflow';

const ICONS = {
  input: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="6.5" height="10" rx="1.5" />
      <path d="M2 8h6M5.5 5.5 8 8l-2.5 2.5" />
    </g>
  ),
  output: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3" width="6.5" height="10" rx="1.5" />
      <path d="M8 8h6M11.5 5.5 14 8l-2.5 2.5" />
    </g>
  ),
  llm: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.2l1.4 3.4L13 7l-3.6 1.4L8 12 6.6 8.4 3 7l3.6-1.4z" />
      <circle cx="12.5" cy="3.5" r="1" />
    </g>
  ),
  text: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M3 7.5h10M3 11h6" />
    </g>
  ),
  filter: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 3.5h11l-4 4.6V13l-3 1V8.1z" />
    </g>
  ),
  math: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v10M3 8h10" />
      <circle cx="4" cy="4" r=".7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" />
    </g>
  ),
  api: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" />
    </g>
  ),
  kb: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5 14 5 8 7.5 2 5z" />
      <path d="M2 8l6 2.5L14 8M2 11l6 2.5L14 11" />
    </g>
  ),
  note: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2.5h7L13 5.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
      <path d="M9.5 2.5V6h3.2" />
    </g>
  ),
};

export const BaseNode = ({
  id,
  title,
  iconType,
  category,
  inputs = [],
  outputs = [],
  selected,
  children,
}) => {
  const rows = Math.max(inputs.length, outputs.length);
  const handleTop = (i) => `${((i + 0.5) / Math.max(rows, 1)) * 100}%`;

  return (
    <div
      className={['node', iconType === 'note' ? 'note-node' : '', selected ? 'selected' : ''].join(' ')}
      style={{ '--cat': category }}
    >
      <div className="node-head">
        <div className="node-ic">
          <svg width="15" height="15" viewBox="0 0 16 16">
            {ICONS[iconType]}
          </svg>
        </div>
        <div className="node-title">{title}</div>
        <div className="node-id">{id}</div>
      </div>

      <div className="node-body">
        {rows > 0 && (
          <div className="ports" style={{ minHeight: rows * 24 }}>
            <div className="port-col">
              {inputs.map((p, i) => (
                <div className="port-row" key={p.id}>
                  <span className="port-dot" />
                  {p.label}
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={p.id}
                    className="handle"
                    style={{ top: handleTop(i) }}
                  />
                </div>
              ))}
            </div>
            <div className="port-col right">
              {outputs.map((p, i) => (
                <div className="port-row" key={p.id}>
                  {p.label}
                  <span className="port-dot" />
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={p.id}
                    className="handle"
                    style={{ top: handleTop(i) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="fields">{children}</div>
      </div>
    </div>
  );
};
