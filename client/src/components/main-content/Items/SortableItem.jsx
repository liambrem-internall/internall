import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import { DraggableComponentTypes } from "../../../utils/constants";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./SortableItem.css";
import { FaEdit } from "react-icons/fa";

const SortableItem = ({
  id,
  content,
  sectionId,
  link,
  onEdit,
  editingUsers = {},
  users = [],
}) => {
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

  const editingUserEntry = Object.entries(editingUsers).find(
    ([, value]) => value.itemId === id
  );
  let borderColor = "transparent";
  if (editingUserEntry && users) {
    const editingUserId = editingUserEntry[0];
    const editingUser = users.find((user) => user.id === editingUserId);
    borderColor = editingUser?.color || "transparent";
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || editingUserEntry ? 0.5 : 1,
    borderRadius: 8,
    boxSizing: "border-box",
    "--border-color": borderColor,
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`sortable-item${editingUserEntry ? " editing" : ""}`}
      ref={setNodeRef}
      style={style}
      onClick={handleItemClick}
    >
      <span className="item-content">{content}</span>
      <div className="right-controls">
        <span
          className="edit-handle"
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <OverlayTrigger
            placement="top"
            delay={{ show: 400, hide: 100 }}
            overlay={<Tooltip id="edit-item-tooltip">Edit Item</Tooltip>}
          >
            <FaEdit size={18} style={{ color: "inherit" }} />
          </OverlayTrigger>
        </span>
        <span
          className="drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: "grab", marginLeft: 8 }}
        >
          <OverlayTrigger
            placement="top"
            delay={{ show: 800, hide: 100 }}
            overlay={
              <Tooltip id="reorder-section-tooltip">Reorder Items</Tooltip>
            }
          >
            <BsGripVertical size={20} style={{ color: "inherit" }} />
          </OverlayTrigger>
        </span>
      </div>
    </div>
  );
};

export default SortableItem;
