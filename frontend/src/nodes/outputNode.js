import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data, selected }) => {
  const [name, setName] = useState(data?.name || 'output_1');
  const [outputType, setOutputType] = useState(data?.type || 'Text');
  const updateNodeField = useStore((state) => state.updateNodeField);

  const onNameChange = (e) => {
    setName(e.target.value);
    updateNodeField(id, 'name', e.target.value);
  };

  const onTypeChange = (e) => {
    setOutputType(e.target.value);
    updateNodeField(id, 'type', e.target.value);
  };

  return (
    <BaseNode
      id={id}
      title="Output"
      iconType="output"
      category="#22d3ee"
      inputs={[{ id: 'value', label: 'value' }]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Name</label>
        <input className="nf-input nodrag nopan" type="text" value={name} onChange={onNameChange} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} />
      </div>
      <div className="field">
        <label className="field-lab">Type</label>
        <select className="nf-select nodrag nopan" value={outputType} onChange={onTypeChange} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <option>Text</option>
          <option>File</option>
          <option>JSON</option>
        </select>
      </div>
    </BaseNode>
  );
};
