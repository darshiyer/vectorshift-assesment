import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data, selected }) => {
  const [note, setNote] = useState(data?.note || 'Pin context or TODOs here.');
  const updateNodeField = useStore((state) => state.updateNodeField);

  return (
    <BaseNode
      id={id}
      title="Note"
      iconType="note"
      category="#b07cff"
      inputs={[]}
      outputs={[]}
      selected={selected}
    >
      <textarea
        className="note-area nodrag nopan"
        value={note}
        placeholder="Write a note…"
        onChange={(e) => {
          setNote(e.target.value);
          updateNodeField(id, 'note', e.target.value);
        }}
        onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
      />
    </BaseNode>
  );
};
