// FlowEdge.js
// A smoothstep edge with a glowing dot continuously traveling along the path —
// a small touch that makes the canvas read as "data is flowing", not static
// wires. Pure SVG (offset-path), no extra dependency.

import { getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';
import './FlowEdge.css';

export const FlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}) => {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      <path
        id={id}
        className={`flow-edge__path ${selected ? 'is-selected' : ''}`}
        d={path}
        style={style}
        markerEnd={markerEnd}
        fill="none"
      />
      <EdgeLabelRenderer>
        <div
          className="flow-edge__dot"
          style={{ offsetPath: `path("${path}")` }}
        />
      </EdgeLabelRenderer>
    </>
  );
};
