import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import "./DroppableSection.css";

const DroppableSection = ({ id, items, title }) => {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="droppable-section"
      ref={setNodeRef}
      style={style}
    >
      <div className="section-header">
        <h3>{title}</h3>
        <span
          className="drag-handle"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
        >
          <BsGripVertical size={20} />
        </span>
      </div>
    </div>
  );
};

export default DroppableSection;
