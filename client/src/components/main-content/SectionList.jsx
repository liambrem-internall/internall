import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import Section from "./Sections/Section";
import GhostComponent from "./Add/GhostComponent";
import Container from "react-bootstrap/Container";
import AddButton from "./Add/AddButton";
import SectionDroppable from "./Sections/SectionDroppable";
import "./SectionList.css";

const SectionList = () => {
  const [sections, setSections] = useState([]);
  const [activeId, setActiveId] = useState(null);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

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
      <div className="sections-scroll-container">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="sections-row">
            {sections.map((section) => (
              <Section key={section.id}>Section {section.id}</Section>
            ))}
            <SectionDroppable onDrop={handleDragEnd} />
          </div>
          <AddButton />
          <DragOverlay>
            {activeId === "add-section" ? (
              <GhostComponent id="new-component-preview" />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Container>
  );
};

export default SectionList;
