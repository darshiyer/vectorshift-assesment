import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const KBNode = ({ id, data, selected }) => {
  const [source, setSource] = useState(data?.source || 'docs');
  const [topk, setTopk] = useState(data?.topk || '5');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Knowledge Base"
      iconType="kb"
      category="#10cf95"
      inputs={[{ id: 'query', label: 'query' }]}
      outputs={[{ id: 'results', label: 'results' }]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Source</label>
        <select
          className="nf-select nodrag nopan"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            updateNodeField(id, 'source', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        >
          <option>docs</option>
          <option>support</option>
          <option>codebase</option>
        </select>
      </div>
      <div className="field">
        <label className="field-lab">Top K</label>
        <input
          className="nf-input nodrag nopan"
          type="text"
          value={topk}
          onChange={(e) => {
            setTopk(e.target.value);
            updateNodeField(id, 'topk', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </BaseNode>
  );
};
