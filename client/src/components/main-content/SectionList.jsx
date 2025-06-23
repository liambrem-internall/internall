import Section from "./Sections/Section";
import Item from "./Items/Item";
import "./SectionList.css";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";

const SectionList = () => {
  const [isDropped, setIsDropped] = useState(false);
  const draggableMarkup = <Item />;

  return (
    <div className="section-list-container">
      <div className="section-list">
        <DndContext onDragEnd={handleDragEnd}>
          {!isDropped ? draggableMarkup : null}
          <Section>{isDropped ? draggableMarkup : "Drop here"}</Section>
        </DndContext>
      </div>
    </div>
  );
  function handleDragEnd(event) {
    if (event.over && event.over.id === "droppable") {
      setIsDropped(true);
    }
  }
};

export default SectionList;
