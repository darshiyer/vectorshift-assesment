// A smoothstep edge matching Pipeline Studio's wire style: a soft gradient
// base stroke between the two nodes' category colors, with an animated
// marching-dash "flow" stroke on top — colored red when the edge sits in a
// detected cycle. Falls back to the brand color if a node can't be resolved.

import { useMemo } from 'react';
import { getSmoothStepPath } from 'reactflow';
import { useStore } from '../store';
import { getConfig } from '../nodes/handles';
import { CATEGORY_COLORS } from '../nodes/registry';
import { useValidation } from '../lib/ValidationContext';
import './FlowEdge.css';

const colorForNode = (node) => {
  const config = node && getConfig(node.type);
  return config ? CATEGORY_COLORS[config.category] : 'var(--brand-500)';
};

export const FlowEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
}) => {
  const nodes = useStore((state) => state.nodes);
  const validation = useValidation();

  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  const isCyclic = useMemo(() => {
    if (!validation) return false;
    return validation.cycleNodes.has(source) && validation.cycleNodes.has(target);
  }, [validation, source, target]);

  const startColor = isCyclic ? 'var(--danger)' : colorForNode(nodes.find((n) => n.id === source));
  const endColor = isCyclic ? 'var(--danger)' : colorForNode(nodes.find((n) => n.id === target));
  const gradientId = `flow-gradient-${id}`;

  return (
    <g className={selected ? 'is-selected' : ''}>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0" style={{ stopColor: startColor }} />
          <stop offset="1" style={{ stopColor: endColor }} />
        </linearGradient>
      </defs>
      <path className="flow-edge__base" d={path} style={{ stroke: `url(#${gradientId})` }} />
      <path
        className="flow-edge__flow"
        d={path}
        markerEnd={markerEnd}
        style={{ stroke: endColor, color: endColor }}
      />
    </g>
  );
};
