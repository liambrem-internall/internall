import Section from "./Sections/Section";
import Item from "./Items/Item";
import "./SectionList.css";
import { useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import Container from "react-bootstrap/Container";
import AddButton from "./Add/AddButton";

const SectionDropZone = ({ onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({ id: "section-dropzone" });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: "200px",
        border: isOver ? "2px dashed #e516b8" : "2px dashed #cdcdcd",
        margin: "2rem 0",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isOver ? "Release to add section" : "Drag here to add a new section"}
    </div>
  );
};

const SectionList = () => {
  const [sections, setSections] = useState([]);

  function handleDragEnd(event) {
    if (
      event.over &&
      event.over.id === "section-dropzone" &&
      event.active.data.current?.type === "section"
    ) {
      setSections((prev) => [...prev, { id: Date.now() }]);
    }
  }

  return (
    <Container className="section-list-container">
      <div className="row justify-content-center">
        <DndContext onDragEnd={handleDragEnd}>
          {sections.map((section) => (
            <Section key={section.id}>Section {section.id}</Section>
          ))}
          <SectionDropZone />
          <AddButton />
          
        </DndContext>
      </div>
    </Container>
  );
};

export default SectionList;
