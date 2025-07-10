import { ContainerWithLidOutline24 } from "metau-meta-icons";
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
      <ContainerWithLidOutline24
        style={{ color: isOver ? "red" : "var(--gray2)" }}
        fontSize={100}
      />
    </div>
  );
};

export default DeleteButton;
