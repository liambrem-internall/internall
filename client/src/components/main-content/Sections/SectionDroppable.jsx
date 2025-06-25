import { useDroppable } from "@dnd-kit/core";
import "./SectionDroppable.css";

const SectionDroppable = ({ onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "section-dropzone" });
  return (
    <div
      className="section-droppable"
      ref={setNodeRef}
      style={{
        background: isOver ? "var(--gray2)" : "var(--gray1)",
      }}
    >
      {isOver ? "Release to add section" : "Drag here to add a new section"}
    </div>
  );
};

export default SectionDroppable;
