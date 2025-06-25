import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import { DraggableComponentTypes } from "../../../utils/constants";
import "./SortableItem.css";

const SortableItem = ({ id, content, sectionId }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: DraggableComponentTypes.ITEM, sectionId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="sortable-item"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {content}
      <div className="drag-handle">
        <BsGripVertical size={20} color="var(--gray2)"/>
      </div>
    </div>
  );
};

export default SortableItem;
