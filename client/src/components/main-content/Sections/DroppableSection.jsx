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

const emptySectionStyle = {
  minHeight: 40,
  border: "2px dashed #ccc",
  borderRadius: 4,
  background: "#fafbfc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#888",
  fontStyle: "italic",
};

const emptySectionOverStyle = {
  ...emptySectionStyle,
  border: "2px dashed var(--pink1)",
  background: "var(--pink3)",
};

const DroppableSection = ({ id, items, title, onItemClick, className="", style={} }) => {
  const { setNodeRef: setSectionDroppableRef, isSectionOver } = useDroppable({
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

  // Always combine refs and attach to the container
  const combinedRef = (node) => {
    setNodeRef(node);
    setSectionDroppableRef(node);
  };

  const containerStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...style,
  };

  return (
    <div className={`droppable-section ${className}`} ref={combinedRef} style={containerStyle}>
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
          {items.length === 0 ? (
            <div style={isSectionOver ? emptySectionOverStyle : emptySectionStyle}>
              Drop item here
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="item"
                onClick={() => onItemClick(item, id)}
                style={{ cursor: "pointer" }}
              >
                <SortableItem
                  id={item.id}
                  content={item.content}
                  sectionId={id}
                  onClick={() => onItemClick(item, id)}
                />
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableSection;