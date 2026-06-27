// toolbar.js
// The node palette. Renders straight from the registry, grouped by category, so
// new node types show up here automatically.

import { DraggableNode } from './draggableNode';
import { toolbarGroups } from './nodes/registry';
import './toolbar.css';

export const PipelineToolbar = () => (
  <aside className="toolbar">
    {toolbarGroups.map((group) => (
      <div className="toolbar__group" key={group.category}>
        <h3 className="toolbar__heading">{group.label}</h3>
        <div className="toolbar__nodes">
          {group.nodes.map((node) => (
            <DraggableNode
              key={node.type}
              type={node.type}
              label={node.label}
              icon={node.icon}
            />
          ))}
        </div>
      </div>
    ))}
  </aside>
);
