import { getBezierPath } from 'reactflow';
import { useStore } from '../store';

// Keyed by node *type* (matches each node component's own `category` prop),
// not by category name — node.type is e.g. "llm" or "input", never "model"/"io".
const CAT = {
  input: '#22d3ee',
  output: '#22d3ee',
  llm: '#7c83ff',
  text: '#b07cff',
  note: '#b07cff',
  filter: '#f5a524',
  math: '#f5a524',
  api: '#10cf95',
  kb: '#10cf95',
};

export const AnimatedEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}) => {
  const nodes = useStore((state) => state.nodes);
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const sourceType = nodes.find((n) => n.id === source)?.type;
  const targetType = nodes.find((n) => n.id === target)?.type;
  const c0 = CAT[sourceType] || '#6e7689';
  const c1 = CAT[targetType] || '#6e7689';
  const gid = 'grad-' + id;

  return (
    <>
      <defs>
        <linearGradient
          id={gid}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0" stopColor={c0} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <path
        id={id}
        className="edge-base"
        d={edgePath}
        stroke={`url(#${gid})`}
        fill="none"
        style={style}
        markerEnd={markerEnd}
      />
      <path
        className="edge-flow"
        d={edgePath}
        stroke={c1}
        fill="none"
      />
    </>
  );
};
