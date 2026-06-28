import { DraggableNode } from './draggableNode';

const CAT = {
  io: '#22d3ee',
  model: '#7c83ff',
  text: '#b07cff',
  logic: '#f5a524',
  data: '#10cf95',
};

const ICON = (type) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {type === 'input' && <><rect x="7" y="3" width="6.5" height="10" rx="1.5" /><path d="M2 8h6M5.5 5.5 8 8l-2.5 2.5" /></>}
    {type === 'output' && <><rect x="2.5" y="3" width="6.5" height="10" rx="1.5" /><path d="M8 8h6M11.5 5.5 14 8l-2.5 2.5" /></>}
    {type === 'llm' && <><path d="M8 2.2l1.4 3.4L13 7l-3.6 1.4L8 12 6.6 8.4 3 7l3.6-1.4z" /><circle cx="12.5" cy="3.5" r="1" /></>}
    {type === 'text' && <><path d="M3 4h10M3 7.5h10M3 11h6" /></>}
    {type === 'filter' && <><path d="M2.5 3.5h11l-4 4.6V13l-3 1V8.1z" /></>}
    {type === 'math' && <><path d="M8 3v10M3 8h10" /><circle cx="4" cy="4" r=".7" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" /></>}
    {type === 'api' && <><circle cx="8" cy="8" r="5.5" /><path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" /></>}
    {type === 'kb' && <><path d="M8 2.5 14 5 8 7.5 2 5z" /><path d="M2 8l6 2.5L14 8M2 11l6 2.5L14 11" /></>}
    {type === 'note' && <><path d="M3 2.5h7L13 5.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1z" /><path d="M9.5 2.5V6h3.2" /></>}
  </svg>
);

const PALETTE = [
  { label: 'Input / Output', cat: 'io', types: [
    { type: 'input', label: 'Input' },
    { type: 'output', label: 'Output' },
  ]},
  { label: 'Models', cat: 'model', types: [
    { type: 'llm', label: 'LLM' },
  ]},
  { label: 'Text', cat: 'text', types: [
    { type: 'text', label: 'Text' },
    { type: 'note', label: 'Note' },
  ]},
  { label: 'Logic', cat: 'logic', types: [
    { type: 'filter', label: 'Filter' },
    { type: 'math', label: 'Math' },
  ]},
  { label: 'Data', cat: 'data', types: [
    { type: 'kb', label: 'Knowledge Base' },
    { type: 'api', label: 'API Request' },
  ]},
];

export const PipelineToolbar = () => {
  return (
    <aside className="palette">
      <div className="palette-head">Node Library</div>
      {PALETTE.map((g, gi) => (
        <div className="pgroup" key={gi}>
          <div className="pgroup-label" style={{ '--gl': CAT[g.cat] }}>{g.label}</div>
          <div className="pchips">
            {g.types.map((t) => (
              <DraggableNode
                key={t.type}
                type={t.type}
                label={t.label}
                icon={ICON(t.type)}
                color={CAT[g.cat]}
              />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};
