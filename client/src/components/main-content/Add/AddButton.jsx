import { useDraggable } from "@dnd-kit/core";
import { BsPlus } from "react-icons/bs";
import "./AddButton.css";

const AddButton = () => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "add-section",
    data: { type: "section" },
  });

  return (
    <button
      ref={setNodeRef}
      className="add-circular-btn"
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <BsPlus className="add-plus-icon" />
    </button>
  );
};

export default AddButton;
