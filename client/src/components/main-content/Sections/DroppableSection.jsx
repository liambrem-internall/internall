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

const DroppableSection = ({ id, items, title, onItemClick }) => {
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

  let sectionContent;
  if (items.length === 0) {
    sectionContent = (
      <div style={isSectionOver ? emptySectionOverStyle : emptySectionStyle}>
        Drop item here
      </div>
    );
  } else {
    sectionContent = items.map((item) => (
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
    ));
  }

  const { setNodeRef: setSectionDroppableRef, isSectionOver: isSectionOver } =
    useDroppable({
      id,
      data: { sectionId: id, type: DraggableComponentTypes.SECTION },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="droppable-section" ref={combinedRef} style={style}>
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
        <div className="section-items">{sectionContent}</div>
      </SortableContext>
    </div>
  );
};

export default DroppableSection;
