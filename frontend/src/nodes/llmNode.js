import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const LLMNode = ({ id, data, selected }) => {
  const [model, setModel] = useState(data?.model || 'gpt-4o');
  const [temp, setTemp] = useState(data?.temp || '0.7');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="LLM"
      iconType="llm"
      category="#7c83ff"
      inputs={[
        { id: 'system', label: 'system' },
        { id: 'prompt', label: 'prompt' },
      ]}
      outputs={[{ id: 'response', label: 'response' }]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Model</label>
        <select
          className="nf-select nodrag nopan"
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            updateNodeField(id, 'model', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        >
          <option>gpt-4o</option>
          <option>claude-3.7</option>
          <option>llama-3.1</option>
          <option>mistral-l</option>
        </select>
      </div>
      <div className="field">
        <label className="field-lab">Temperature</label>
        <input
          className="nf-input nodrag nopan"
          type="text"
          value={temp}
          onChange={(e) => {
            setTemp(e.target.value);
            updateNodeField(id, 'temp', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </BaseNode>
  );
};
