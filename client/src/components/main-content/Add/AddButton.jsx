import { useDraggable } from "@dnd-kit/core";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { PlusOutline24 } from "metau-meta-icons";
import { SectionActions, DraggableComponentTypes } from "../../../utils/constants";
import "./AddButton.css";

const AddButton = () => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: SectionActions.ADD,
    data: { type: DraggableComponentTypes.ADD_NEW },
  });

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 500, hide: 100 }}
      overlay={<Tooltip id="add-section-tooltip">Add a new section/item</Tooltip>}
    >
      <button
        ref={setNodeRef}
        className="add-circular-btn"
        {...listeners}
        {...attributes}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <PlusOutline24 className="add-plus-icon" />
      </button>
    </OverlayTrigger>
  );
};

export default AddButton;
