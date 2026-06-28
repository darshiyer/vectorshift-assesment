import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const MathNode = ({ id, data, selected }) => {
  const [op, setOp] = useState(data?.op || 'add');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Math"
      iconType="math"
      category="#f5a524"
      inputs={[
        { id: 'a', label: 'a' },
        { id: 'b', label: 'b' },
      ]}
      outputs={[{ id: 'result', label: 'result' }]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Operation</label>
        <select
          className="nf-select nodrag nopan"
          value={op}
          onChange={(e) => {
            setOp(e.target.value);
            updateNodeField(id, 'op', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        >
          <option>add</option>
          <option>subtract</option>
          <option>multiply</option>
          <option>divide</option>
        </select>
      </div>
    </BaseNode>
  );
};
