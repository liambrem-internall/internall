import { useDroppable } from "@dnd-kit/core";
import "./NewSectionDropZone.css";

const NewSectionDropZone = () => {
  const { setNodeRef, isOver } = useDroppable({ id: "section-dropzone" });
  return (
    <div
      className="section-droppable"
      ref={setNodeRef}
      style={{
        background: isOver ? "var(--gray2)" : "var(--gray1)",
        border: isOver ? "2px solid var(--primary)" : "2px dashed var(--gray3)",
        transition: "background 0.2s, border 0.2s",
      }}
    >
      {isOver ? "Release to add section" : "Drag here to add a new section"}
    </div>
  );
};

export default NewSectionDropZone;