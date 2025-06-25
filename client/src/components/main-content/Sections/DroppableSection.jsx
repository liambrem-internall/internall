import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./DroppableSection.css";

const DroppableSection = ({ id, items, title }) => {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="droppable-section" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <h1>{title}</h1>
    </div>
  );
};

export default DroppableSection;