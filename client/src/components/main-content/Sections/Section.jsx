//import { DroppableStory } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import Container from "react-bootstrap/Container";
import "./Section.css";

const Section = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div className="section-container">
      <Container className="section" ref={setNodeRef} style={style} />
    </div>
  );
};

// <DroppableStory containers={["A", "B", "C"]} />

export default Section;
