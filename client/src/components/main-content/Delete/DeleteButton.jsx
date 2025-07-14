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
        style={{ color: isOver ? "red" : "var(--gray2)" }}
        fontSize={75}
      />
    </div>
  );
};

export default DeleteButton;
