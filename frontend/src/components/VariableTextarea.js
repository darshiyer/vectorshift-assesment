// Auto-resizing textarea that suggests pipeline variables. When the caret sits
// just after an open "{{", it offers the names of the pipeline's Input nodes so
// users can wire variables without remembering exact names.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore } from '../store';
import './VariableTextarea.css';

// The pipeline's variables are the names exposed by its Input nodes.
const inputNamesSelector = (state) =>
  state.nodes
    .filter((node) => node.type === 'customInput')
    .map(
      (node) =>
        node.data?.inputName ?? node.id.replace('customInput-', 'input_')
    );

// Match an unclosed "{{" plus any identifier characters typed so far.
const OPEN_TOKEN = /\{\{\s*([A-Za-z0-9_$]*)$/;

export const VariableTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  const inputNames = useStore(inputNamesSelector, shallow);
  const [query, setQuery] = useState(null); // null = closed
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const suggestions = useMemo(() => {
    if (query === null) return [];
    const q = query.toLowerCase();
    return inputNames
      .filter((name) => name.toLowerCase().startsWith(q) && name !== query)
      .slice(0, 6);
  }, [query, inputNames]);

  const open = suggestions.length > 0;

  const refreshQuery = (el) => {
    const before = el.value.slice(0, el.selectionStart);
    const match = before.match(OPEN_TOKEN);
    setQuery(match ? match[1] : null);
    setActive(0);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    refreshQuery(e.target);
  };

  const applySuggestion = (name) => {
    const el = ref.current;
    const caret = el.selectionStart;
    const before = el.value.slice(0, caret).replace(OPEN_TOKEN, `{{ ${name} }}`);
    const after = el.value.slice(caret);
    const next = before + after;
    onChange(next);
    setQuery(null);
    // Restore the caret just past the inserted variable.
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = before.length;
    });
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(suggestions[active]);
    } else if (e.key === 'Escape') {
      setQuery(null);
    }
  };

  return (
    <div className="var-textarea">
      <textarea
        ref={ref}
        className="node-control node-textarea"
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setQuery(null), 120)}
        onClick={(e) => refreshQuery(e.target)}
      />

      {open && (
        <ul className="var-suggest">
          {suggestions.map((name, i) => (
            <li
              key={name}
              className={`var-suggest__item ${i === active ? 'is-active' : ''}`}
              // onMouseDown (not onClick) so it fires before the textarea blur.
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(name);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="var-suggest__brace">{'{{'}</span>
              {name}
              <span className="var-suggest__brace">{'}}'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
