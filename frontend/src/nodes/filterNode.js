import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const FilterNode = ({ id, data, selected }) => {
  const [cond, setCond] = useState(data?.cond || 'score > 0.5');
  const [op, setOp] = useState(data?.op || 'keep');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Filter"
      iconType="filter"
      category="#f5a524"
      inputs={[{ id: 'in', label: 'input' }]}
      outputs={[
        { id: 'pass', label: 'pass' },
        { id: 'fail', label: 'fail' },
      ]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Condition</label>
        <input
          className="nf-input nodrag nopan"
          type="text"
          value={cond}
          onChange={(e) => {
            setCond(e.target.value);
            updateNodeField(id, 'cond', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="field">
        <label className="field-lab">Mode</label>
        <select
          className="nf-select nodrag nopan"
          value={op}
          onChange={(e) => {
            setOp(e.target.value);
            updateNodeField(id, 'op', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        >
          <option>keep</option>
          <option>drop</option>
          <option>dedupe</option>
        </select>
      </div>
    </BaseNode>
  );
};
