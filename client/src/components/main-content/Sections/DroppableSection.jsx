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
  users = [],
  currentUserId,
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
          {items.map((item) => {
            const editingUserEntry = Object.entries(editingUsers).find(
              ([, value]) => value.itemId === item.id
            );
            const isBeingEditedByOther =
              editingUserEntry && editingUserEntry[0] !== currentUserId;
            return (
              <div
                key={item.id}
                className={DraggableComponentTypes.ITEM}
                style={{
                  cursor: isBeingEditedByOther ? "not-allowed" : "pointer",
                  pointerEvents: isBeingEditedByOther ? "none" : "auto",
                }}
              >
                <SortableItem
                  id={item.id}
                  content={item.content}
                  sectionId={id}
                  link={item.link}
                  onEdit={() => onItemClick(item, id)}
                  editingUsers={editingUsers}
                  users={users}
                  currentUserId={currentUserId}
                />
              </div>
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableSection;
