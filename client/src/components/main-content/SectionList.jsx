import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import GhostComponent from "./Add/GhostComponent";
import AddButton from "./Add/AddButton";
import NewSectionDropZone from "./Sections/NewSectionDropZone";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DroppableSection from "./Sections/DroppableSection";
import "./SectionList.css";

const SectionList = () => {
  const [sections, setSections] = useState({
    A: [{ id: "A1", title: "Section 1" }],
    B: [{ id: "B1", title: "Section 2" }],
    C: [{ id: "C1", title: "Section 3" }],
  });
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState(Object.keys(sections));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      setSectionOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
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

    setActiveId(null);
  };

  const handleSaveSection = () => {
    const newKey = `S${Date.now()}`; // crates a unique key based on time created
    setSections((prev) => ({
      ...prev,
      [newKey]: [{ id: `${newKey}-1`, title: pendingSectionTitle }],
    }));
    setSectionOrder((prev) => [...prev, newKey]);
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
            collisionDetection={pointerWithin}
          >
            <SortableContext
              items={sectionOrder}
              strategy={horizontalListSortingStrategy}
            >
              <div className="sections-row">
                {sectionOrder.map((sectionId) => (
                  <DroppableSection
                    key={sectionId}
                    id={sectionId}
                    items={sections[sectionId]}
                    title={sections[sectionId][0]?.title || ""}
                  />
                ))}
                {activeId == "add-section" && (
                  <NewSectionDropZone onDrop={handleDragEnd} />
                )}
              </div>
            </SortableContext>
            <AddButton />
            <DragOverlay dropAnimation={null}>
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
