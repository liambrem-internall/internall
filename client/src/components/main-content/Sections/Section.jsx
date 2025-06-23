//import { DroppableStory } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import "./Section.css";

const section = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div className="section" ref={setNodeRef}>
      {props.children}
    </div>
  );
};

// <DroppableStory containers={["A", "B", "C"]} />

export default section;
