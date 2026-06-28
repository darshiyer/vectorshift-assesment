import { useState, useMemo } from 'react';
import { useStore } from './store';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const cycleNodes = (nodes, edges) => {
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => {
    if (adj[e.source]) adj[e.source].push(e.target);
  });
  let idx = 0;
  const stack = [],
    on = {},
    low = {},
    num = {},
    res = new Set();
  const dfs = (v) => {
    num[v] = low[v] = idx++;
    stack.push(v);
    on[v] = 1;
    for (const w of adj[v]) {
      if (num[w] === undefined) {
        dfs(w);
        low[v] = Math.min(low[v], low[w]);
      } else if (on[w]) {
        low[v] = Math.min(low[v], num[w]);
      }
    }
    if (low[v] === num[v]) {
      const c = [];
      let w;
      do {
        w = stack.pop();
        on[w] = 0;
        c.push(w);
      } while (w !== v);
      if (c.length > 1) c.forEach((x) => res.add(x));
    }
  };
  nodes.forEach((n) => {
    if (num[n.id] === undefined) dfs(n.id);
  });
  edges.forEach((e) => {
    if (e.source === e.target) res.add(e.source);
  });
  return res;
};

const warnNodes = (nodes, edges) => {
  const conn = new Set();
  edges.forEach((e) => {
    conn.add(e.source);
    conn.add(e.target);
  });
  return nodes.filter((n) => n.type !== 'note' && !conn.has(n.id)).map((n) => n.id);
};

export const Topbar = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const setNodes = useStore((state) => state.setNodes);
  const setEdges = useStore((state) => state.setEdges);

  const [modal, setModal] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);

  const cyc = useMemo(() => cycleNodes(nodes, edges), [nodes, edges]);
  const warns = useMemo(() => warnNodes(nodes, edges), [nodes, edges]);
  const status = cyc.size ? 'errors' : warns.length ? 'warnings' : 'valid';

  const submit = async () => {
    try {
      const res = await fetch(`${API_BASE}/pipelines/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({ id: n.id, type: n.type })),
          edges: edges.map((e) => ({ source: e.source, target: e.target })),
        }),
      });
      if (!res.ok) throw new Error('Request failed (' + res.status + ')');
      const d = await res.json();
      setModal({
        nodes: d.num_nodes,
        edges: d.num_edges,
        isDag: d.is_dag,
        order: d.execution_order || [],
        cycles: d.cycle_nodes || [],
        depth: d.max_depth || 0,
        types: d.node_types || {},
        warnings: d.warnings || [],
        entry: d.entry_nodes || [],
        terminal: d.terminal_nodes || [],
        error: null,
      });
    } catch (err) {
      setModal({
        nodes: nodes.length,
        edges: edges.length,
        isDag: false,
        order: [],
        cycles: [],
        depth: 0,
        types: {},
        warnings: [],
        entry: [],
        terminal: [],
        error: err.message,
      });
    }
  };

  const closeModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setModal(null);
      setModalClosing(false);
    }, 200);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const labels = { valid: 'Pipeline valid', warnings: 'Has warnings', errors: 'Has errors' };

  const typeChip = (t, count) => {
    const map = {
      input: { title: 'Input', cat: '#22d3ee' },
      output: { title: 'Output', cat: '#22d3ee' },
      llm: { title: 'LLM', cat: '#7c83ff' },
      text: { title: 'Text', cat: '#b07cff' },
      filter: { title: 'Filter', cat: '#f5a524' },
      math: { title: 'Math', cat: '#f5a524' },
      api: { title: 'API Request', cat: '#10cf95' },
      kb: { title: 'Knowledge Base', cat: '#10cf95' },
      note: { title: 'Note', cat: '#b07cff' },
    };
    const d = map[t] || { title: t, cat: '#6e7689' };
    return (
      <div className="mchip" key={t} style={{ '--cat': d.cat }}>
        <span className="mchip-dot" />
        {d.title}
        <span className="mchip-n">{count}</span>
      </div>
    );
  };

  const ok = modal && !modal.error && modal.isDag && modal.nodes > 0;

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <svg className="brand-glyph" viewBox="0 0 34 34" fill="none">
            <defs>
              <linearGradient id="bgrad" x1="0" y1="0" x2="34" y2="34">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset=".55" stopColor="#7c83ff" />
                <stop offset="1" stopColor="#b07cff" />
              </linearGradient>
            </defs>
            <path className="lk" d="M9 9 L25 17 M25 17 L9 25" stroke="url(#bgrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
            <circle className="nd nd1" cx="9" cy="9" r="4.4" fill="url(#bgrad)" />
            <circle className="nd nd2" cx="25" cy="17" r="4.4" fill="url(#bgrad)" />
            <circle className="nd nd3" cx="9" cy="25" r="4.4" fill="url(#bgrad)" />
          </svg>
          <div>
            <div className="brand-title">Pipeline Studio</div>
            <div className="brand-sub">node orchestration</div>
          </div>
        </div>
        <div className="tb-center">
          <div className={`pill ${status === 'valid' ? 'is-valid' : status === 'warnings' ? 'is-warn' : 'is-err'}`}>
            <span className="dot"></span>
            {labels[status]}
          </div>
          <div className="counters">
            <div className="ctr">
              <b>{nodes.length}</b>
              <span>nodes</span>
            </div>
            <div className="ctr">
              <b>{edges.length}</b>
              <span>edges</span>
            </div>
          </div>
        </div>
        <div className="tb-actions">
          <button className="btn" onClick={clearAll}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 4h9M5.5 4V2.7c0-.4.3-.7.7-.7h1.6c.4 0 .7.3.7.7V4M4 4l.4 7.3c0 .4.3.7.7.7h3.8c.4 0 .7-.3.7-.7L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Clear
          </button>
          <button className="btn btn-primary" onClick={submit}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 7.5h8M7.5 4l3.5 3.5L7.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Submit Pipeline
          </button>
        </div>
      </header>

      {modal && (
        <div className={`scrim ${modalClosing ? 'closing' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-top">
              <div className="modal-x" onClick={closeModal}>
                <svg width="13" height="13" viewBox="0 0 13 13">
                  <path d="M3 3l7 7M10 3l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="modal-verdict">
                <div className={`verdict-ic ${ok ? 'ok' : 'bad'}`}>
                  {ok ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <div className="verdict-t">
                  <b>{modal.error ? 'Backend unreachable' : ok ? 'Valid pipeline' : 'Invalid pipeline'}</b>
                  <span>
                    {modal.error
                      ? modal.error + '. Make sure the API is running.'
                      : ok
                      ? 'This graph is a directed acyclic graph — ready to run.'
                      : modal.cycles.length
                      ? 'A cycle was detected — pipelines must be acyclic.'
                      : 'Add at least one node to run.'}
                  </span>
                </div>
              </div>
            </div>
            <div className={`modal-stats ${ok ? 'three' : ''}`}>
              <div className="mstat">
                <b>{modal.nodes}</b>
                <span>Nodes</span>
              </div>
              <div className="mstat">
                <b>{modal.edges}</b>
                <span>Edges</span>
              </div>
              {ok && (
                <div className="mstat">
                  <b>{modal.depth}</b>
                  <span>Depth</span>
                </div>
              )}
            </div>
            <div className="modal-body">
              {!modal.error && Object.keys(modal.types).length > 0 && (
                <div className="modal-sec">
                  <div className="sec-h">Composition</div>
                  <div className="mchips">{Object.entries(modal.types).map(([t, c]) => typeChip(t, c))}</div>
                </div>
              )}
              {ok && (modal.entry.length > 0 || modal.terminal.length > 0) && (
                <div className="modal-sec">
                  <div className="sec-h">Flow</div>
                  <div className="flow">
                    <div className="flow-col">
                      <span className="flow-lab">Entry</span>
                      {modal.entry.length ? modal.entry.map((id) => (
                        <code className="flow-id" key={id}>{id}</code>
                      )) : <span className="flow-none">—</span>}
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-col">
                      <span className="flow-lab">Output</span>
                      {modal.terminal.length ? modal.terminal.map((id) => (
                        <code className="flow-id" key={id}>{id}</code>
                      )) : <span className="flow-none">—</span>}
                    </div>
                  </div>
                </div>
              )}
              {modal.warnings.length > 0 && (
                <div className="modal-sec">
                  <div className="sec-h">{modal.warnings.length + (modal.warnings.length > 1 ? ' warnings' : ' warning')}</div>
                  <div className="warn-list">
                    {modal.warnings.map((w, i) => (
                      <div className="warn-row" key={i}>
                        <span className="warn-dot" />
                        {w.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-sec">
                <div className="sec-h">{ok ? 'Execution order' : 'Issue'}</div>
                {ok ? (
                  <div className="order-list">
                    {modal.order.map((id, i) => {
                      const n = nodes.find((x) => x.id === id);
                      const cat = n ? (
                        n.type === 'input' || n.type === 'output' ? '#22d3ee' :
                        n.type === 'llm' ? '#7c83ff' :
                        n.type === 'text' || n.type === 'note' ? '#b07cff' :
                        n.type === 'filter' || n.type === 'math' ? '#f5a524' :
                        '#10cf95'
                      ) : '#888';
                      const title = n ? (
                        n.type === 'input' ? 'Input' : n.type === 'output' ? 'Output' :
                        n.type === 'llm' ? 'LLM' : n.type === 'text' ? 'Text' :
                        n.type === 'filter' ? 'Filter' : n.type === 'math' ? 'Math' :
                        n.type === 'api' ? 'API Request' : n.type === 'kb' ? 'Knowledge Base' :
                        n.type === 'note' ? 'Note' : n.type
                      ) : '';
                      return (
                        <div className="order-row" key={id} style={{ animationDelay: i * 45 + 'ms' }}>
                          <div className="order-n">{i + 1}</div>
                          <div className="order-id">{id}</div>
                          <div className="order-cat" style={{ '--cat': cat }}>{title}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="order-bad">
                    {modal.error
                      ? modal.error
                      : modal.cycles.length
                      ? 'Nodes in cycle: ' + modal.cycles.join(' → ') + '. Remove a connecting edge to break the loop.'
                      : 'Drag a node onto the canvas, then connect and submit.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
