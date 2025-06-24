import { useDroppable } from "@dnd-kit/core";
import Container from "react-bootstrap/Container";
import "./Section.css";

const Section = () => {
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

export default Section;
