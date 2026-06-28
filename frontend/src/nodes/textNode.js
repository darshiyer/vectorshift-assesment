import { useState, useRef, useEffect } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

const VAR_REGEX = /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g;

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(data?.text || '{{input}}');
  const [ac, setAc] = useState(null);
  const textareaRef = useRef(null);
  const updateNodeField = useStore((state) => state.updateNodeField);
  const inputNodes = useStore((state) =>
    state.nodes.filter((n) => n.type === 'input').map((n) => n.data?.name || n.id)
  );

  const vars = Array.from(text.matchAll(VAR_REGEX)).map((m) => m[1]);
  const uniqueVars = [...new Set(vars)];
  const inputs = [{ id: 'in', label: 'input' }, ...uniqueVars.map((v) => ({ id: v, label: v }))];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(160, textareaRef.current.scrollHeight) + 'px';
    }
  }, [text]);

  const onTextInput = (e) => {
    const v = e.target.value;
    const caret = e.target.selectionStart;
    setText(v);
    updateNodeField(id, 'text', v);

    const open = v.lastIndexOf('{{', caret - 1);
    if (open !== -1) {
      const close = v.indexOf('}}', open);
      if (close === -1 || close >= caret) {
        const q = v.slice(open + 2, caret).trim();
        setAc({ start: open, caret, q });
        return;
      }
    }
    setAc(null);
  };

  const pickVar = (name) => {
    if (!ac) return;
    const v = text;
    const before = v.slice(0, ac.start);
    const after = v.slice(ac.caret);
    const nv = before + '{{' + name + '}}' + after;
    setText(nv);
    updateNodeField(id, 'text', nv);
    setAc(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const suggestions = ac
    ? [...inputNodes, 'context', 'history', 'query'].filter((k) =>
        k.toLowerCase().includes(ac.q.toLowerCase())
      )
    : [];

  return (
    <BaseNode
      id={id}
      title="Text"
      iconType="text"
      category="#b07cff"
      inputs={inputs}
      outputs={[{ id: 'output', label: 'output' }]}
      selected={selected}
    >
      <div className="field" style={{ position: 'relative' }}>
        <label className="field-lab">Template</label>
        <textarea
          ref={textareaRef}
          className="nf-area nodrag nopan"
          value={text}
          rows={3}
          onChange={onTextInput}
          onBlur={() => setTimeout(() => setAc(null), 140)}
          onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
        />
        {ac && suggestions.length > 0 && (
          <div className="ac">
            <div className="ac-head">Variables</div>
            {suggestions.map((it, i) => (
              <div
                className={'ac-item nodrag nopan' + (i === 0 ? ' on' : '')}
                key={it}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pickVar(it);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span>{'{{'}</span>
                <span className="vk">{it}</span>
                <span>{'}}'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {uniqueVars.length > 0 && (
        <div className="field">
          <label className="field-lab">Detected Variables</label>
          <div className="var-chips">
            {uniqueVars.map((v) => (
              <span className="var-chip" key={v}>
                {'{{' + v + '}}'}
              </span>
            ))}
          </div>
        </div>
      )}
    </BaseNode>
  );
};
