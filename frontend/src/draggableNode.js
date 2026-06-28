export const DraggableNode = ({ type, label, icon, color }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="pchip"
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      style={{ '--cat': color }}
      draggable
    >
      <span className="pchip-ic">{icon}</span>
      <span className="pchip-label">{label}</span>
      <span className="pchip-grab">⋮⋮</span>
    </div>
  );
};
