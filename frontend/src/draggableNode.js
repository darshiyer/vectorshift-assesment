// A draggable palette chip. Stashes its node type on the drag's dataTransfer
// so the canvas knows what to create when it's dropped.
export const DraggableNode = ({ type, label, icon, color }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="palette-node"
      style={{ '--cat': color }}
      draggable
      onDragStart={onDragStart}
    >
      <span className="palette-node__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="palette-node__label">{label}</span>
      <span className="palette-node__grab" aria-hidden="true">
        ⋮⋮
      </span>
    </div>
  );
};
