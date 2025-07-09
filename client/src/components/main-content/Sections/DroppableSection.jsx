import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { BsGripVertical } from "react-icons/bs";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "../Items/SortableItem";
import { DraggableComponentTypes } from "../../../utils/constants";

import "./DroppableSection.css";

const DroppableSection = ({
  id,
  items,
  title,
  onItemClick,
  className = "",
  editingUsers = {},
  users = {},
}) => {
  const { setNodeRef: setSectionDroppableRef } = useDroppable({
    id,
    data: { sectionId: id, type: DraggableComponentTypes.SECTION },
  });
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: DraggableComponentTypes.SECTION } });

  const combinedRef = (node) => {
    setNodeRef(node);
    setSectionDroppableRef(node);
  };

  const containerStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className={`droppable-section ${className}`}
      ref={combinedRef}
      style={containerStyle}
    >
      <div className="section-header">
        <h3>{title}</h3>
        <OverlayTrigger
          placement="top"
          delay={{ show: 500, hide: 100 }}
          overlay={
            <Tooltip id="reorder-section-tooltip">Reorder Sections</Tooltip>
          }
        >
          <span
            className="drag-handle"
            style={{ cursor: "grab" }}
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
          >
            <BsGripVertical size={20} />
          </span>
        </OverlayTrigger>
      </div>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="section-items">
          {items.map((item) => (
            <div
              key={item.id}
              className={DraggableComponentTypes.ITEM}
              onClick={() => onItemClick(item, id)}
              style={{ cursor: "pointer" }}
            >
              <SortableItem
                id={item.id}
                content={item.content}
                sectionId={id}
                onClick={() => onItemClick(item, id)}
                editingUsers={editingUsers}
                users={users}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableSection;
