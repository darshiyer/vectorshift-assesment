// draggableNode.js
// A single draggable chip in the palette. Carries its node type through the
// drag's dataTransfer so the canvas knows what to create on drop.

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="palette-node" draggable onDragStart={onDragStart}>
      <span className="palette-node__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="palette-node__label">{label}</span>
    </div>
  );
};
