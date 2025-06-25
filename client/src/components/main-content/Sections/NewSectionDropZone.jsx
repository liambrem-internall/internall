import { useDroppable } from "@dnd-kit/core";
import "./NewSectionDropZone.css";

const RELEASE_TO_ADD = "Release to add section";
const DRAG_TO_ADD = "Drag here to add a new section";

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
      {isOver ? RELEASE_TO_ADD : DRAG_TO_ADD}
    </div>
  );
};

export default NewSectionDropZone;