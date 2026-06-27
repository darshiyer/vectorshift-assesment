// A smoothstep edge with a glowing dot traveling along the path, so the canvas
// reads as "data flowing" rather than static wires. Uses CSS offset-path.

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
