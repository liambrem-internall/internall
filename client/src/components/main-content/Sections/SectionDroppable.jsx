import { useDroppable } from "@dnd-kit/core";
import "./SectionDroppable.css";

const SectionDroppable = ({ onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "section-dropzone" });
  return (
    <div
      className="section-droppable"
      ref={setNodeRef}
      style={{
        border: isOver ? "2px dashed #e516b8" : "2px dashed #cdcdcd",
      }}
    >
      {isOver ? "Release to add section" : "Drag here to add a new section"}
    </div>
  );
};

export default SectionDroppable;
