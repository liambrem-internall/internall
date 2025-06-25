import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import SortableItem from "../Items/SortableItem";
import { DraggableComponentTypes } from "../../../utils/constants";
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
  } = useSortable({ id, type: DraggableComponentTypes.SECTION });

  const { setNodeRef: setEmptyRef, isOver } = useDroppable({
    id: `${id}-empty-dropzone`,
    data: { sectionId: id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="droppable-section" ref={setNodeRef} style={style}>
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
          {items.length === 0 ? (
            <div
              ref={setEmptyRef}
              style={{
                minHeight: 40,
                border: isOver ? "2px dashed var(--pink1)" : "2px dashed #ccc",
                borderRadius: 4,
                background: isOver ? "var(--pink3)" : "#fafbfc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontStyle: "italic",
              }}
            >
              Drop item here
            </div>
          ) : (
            items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                content={item.content}
                sectionId={id}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableSection;
