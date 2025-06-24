import { useDraggable } from "@dnd-kit/core";

const NewComponent = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1rem",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      New Component
    </div>
  );
};

export default NewComponent;