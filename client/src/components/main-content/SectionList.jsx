import Section from "./Sections/Section";
import Item from "./Items/Item";
import "./SectionList.css";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Container from "react-bootstrap/Container";


const SectionList = () => {
  const [isDropped, setIsDropped] = useState(false);
  const draggableMarkup = <Item />;

  return (
    <Container className="section-list-container">
      <div className="row justify-content-center">
        <DndContext onDragEnd={handleDragEnd}>
          {!isDropped ? draggableMarkup : null}
          <Section>{isDropped ? draggableMarkup : "Drop here"}</Section>
        </DndContext>
      </div>
    </Container>
  );
  function handleDragEnd(event) {
    if (event.over && event.over.id === "droppable") {
      setIsDropped(true);
    }
  }
};

export default SectionList;
