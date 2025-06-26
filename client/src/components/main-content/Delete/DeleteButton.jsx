import { BsTrashFill } from "react-icons/bs";
import { useDroppable } from "@dnd-kit/core";
import { SectionActions } from "../../../utils/constants";
import "./DeleteButton.css";

const DeleteButton = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: SectionActions.DELETE_ZONE,
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
