// NodeField.js
// Declarative field renderer. A node config describes its inputs as data; this
// component maps each field descriptor to the right control. Adding a new field
// type means adding one case here, not touching any node.

import { useLayoutEffect, useRef } from 'react';
import { VariableTextarea } from './VariableTextarea';

const AutoResizeTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);

  // Grow the textarea to fit its content on every value change.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="node-control node-textarea"
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const NodeField = ({ field, value, onChange }) => {
  const labelId = `${field.name}-label`;

  return (
    <label className="node-field" id={labelId}>
      {field.label && <span className="node-field__label">{field.label}</span>}

      {field.type === 'select' ? (
        <select
          className="node-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' && field.suggest ? (
        <VariableTextarea
          value={value}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      ) : field.type === 'textarea' ? (
        <AutoResizeTextarea
          value={value}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      ) : (
        <input
          className="node-control"
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
};
