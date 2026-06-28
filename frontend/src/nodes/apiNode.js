import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const APINode = ({ id, data, selected }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url, setUrl] = useState(data?.url || 'https://api.acme.dev/v1');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="API Request"
      iconType="api"
      category="#10cf95"
      inputs={[{ id: 'body', label: 'body' }]}
      outputs={[{ id: 'response', label: 'response' }]}
      selected={selected}
    >
      <div className="field">
        <label className="field-lab">Method</label>
        <select
          className="nf-select nodrag nopan"
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            updateNodeField(id, 'method', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>
      <div className="field">
        <label className="field-lab">URL</label>
        <input
          className="nf-input nodrag nopan"
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            updateNodeField(id, 'url', e.target.value);
          }}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        />
      </div>
    </BaseNode>
  );
};
