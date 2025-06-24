import { useDroppable } from "@dnd-kit/core";
import Container from "react-bootstrap/Container";
import "./Section.css";

const Section = ({ title }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <Container className="section" ref={setNodeRef} style={style}>
      <h1>{title}</h1>
    </Container>
  );
};

export default Section;
