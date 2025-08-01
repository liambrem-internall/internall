import { useDroppable } from "@dnd-kit/core";
import "./NewSectionDropZone.css";
import { SectionActions } from "../../../utils/constants";

const RELEASE_TO_ADD = "Release to add section";
const DRAG_TO_ADD = "Drag here to add a new section";

const NewSectionDropZone = ({ isDraggingSection }) => {
  const { setNodeRef, isOver } = useDroppable({ id: SectionActions.DROPZONE });

  if (!isDraggingSection) return null;

  const dropZoneBackground = isOver ? "var(--dark1)" : "var(--dark2)";
  const dropZoneBorder = isOver
    ? "2px solid var(--pink2)"
    : "2px dashed var(--gray2)";
  const dropZoneTransition = "background 0.2s, border 0.2s";

  return (
    <div
      className="section-droppable"
      ref={setNodeRef}
      style={{
        background: dropZoneBackground,
        border: dropZoneBorder,
        transition: dropZoneTransition,
      }}
    >
      {isOver ? RELEASE_TO_ADD : DRAG_TO_ADD}
    </div>
  );
};

export default NewSectionDropZone;
