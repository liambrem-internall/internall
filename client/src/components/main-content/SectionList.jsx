import { useState } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Section from "./Sections/Section";
import GhostComponent from "./Add/GhostComponent";
import AddButton from "./Add/AddButton";
import SectionDroppable from "./Sections/SectionDroppable";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import SortableSection from "./Sections/SortableSection";
import "./SectionList.css";

const SectionList = () => {
  const [sections, setSections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
    setSections((prevSections) => {
      const oldIndex = prevSections.findIndex(section => section.id === active.id);
      const newIndex = prevSections.findIndex(section => section.id === over.id);
      return arrayMove(prevSections, oldIndex, newIndex);
    });
  }
  
    if (
      event.over &&
      event.over.id === "section-dropzone" &&
      event.active.data.current?.type === "section"
    ) {
      setShowModal(true);
      setPendingSectionTitle("");
    }
  }

  const handleSaveSection = () => {
    const id = Date.now();
    setSections((prev) => [...prev, { id, title: pendingSectionTitle }]);
    setShowModal(false);
    setPendingSectionTitle("");
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Container className="section-list-container">
        <div className="sections-scroll-container">
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="sections-row">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    id={section.id}
                    title={section.title}
                  />
                ))}
                {activeId && <SectionDroppable onDrop={handleDragEnd} />}
              </div>
            </SortableContext>
            <AddButton />
            <DragOverlay>
              {activeId === "add-section" ? (
                <GhostComponent id="new-component-preview" />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Section Title</Modal.Title>
        </Modal.Header>
        <Form.Control
          id="sectionTitle"
          size="lg"
          type="text"
          placeholder="Title"
          value={pendingSectionTitle}
          onChange={(e) => setPendingSectionTitle(e.target.value)}
        />
        <Modal.Footer>
          <Button variant="primary" onClick={handleSaveSection}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SectionList;
