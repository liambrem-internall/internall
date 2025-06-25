import { BsTrashFill } from "react-icons/bs";
import { useDroppable } from "@dnd-kit/core";
import "./DeleteButton.css";

const DeleteButton = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "delete-zone",
    data: { type: "DELETE" },
  });

  return (
    <div className="delete-btn" ref={setNodeRef}>
      <BsTrashFill
        className="trash-icon"
        style={{ color: isOver ? "red" : "var(--gray2)" }}
        size={100}
      />
    </div>
  );
};

export default DeleteButton;
