import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import { DraggableComponentTypes } from "../../../utils/constants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./SortableItem.css";

const SortableItem = ({ id, content, sectionId, onClick }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: DraggableComponentTypes.ITEM, sectionId },
  });

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
      onClick={onClick} 
    >
      {content}
      <span
        className="drag-handle"
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()} 
        style={{ cursor: "grab", marginLeft: 8 }}
      >
        <OverlayTrigger
          placement="top"
          delay={{ show: 800, hide: 100 }}
          overlay={
            <Tooltip id="reorder-section-tooltip">Reorder Items</Tooltip>
          }
        >
          <BsGripVertical size={20} color="white" />
        </OverlayTrigger>
      </span>
    </div>
  );
};

export default SortableItem;
