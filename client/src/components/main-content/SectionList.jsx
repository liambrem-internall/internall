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
import { DraggableComponentTypes, SectionActions } from "../../utils/constants";

const SectionList = () => {
  const [sections, setSections] = useState({
    A: {
      id: "A",
      title: "Section 1",
      items: [
        { id: "A-1", content: "Item 1" },
        { id: "A-2", content: "Item 2" },
      ],
    },
    B: {
      id: "B",
      title: "Section 2",
      items: [
        { id: "B-1", content: "Item 1" },
        { id: "B-2", content: "Item 2" },
      ],
    },
    C: {
      id: "C",
      title: "Section 3",
      items: [
        { id: "C-1", content: "Item 1" },
        { id: "C-2", content: "Item 2" },
        { id: "C-3", content: "Item 3" },
      ],
    },
  });
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState(Object.keys(sections));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEndSection = (active, over) => {
    if (active.id !== over.id) {
      setSectionOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDragEndItem = (active, over) => {
    const fromSectionId = active.data.current.sectionId;
    const toSectionId = over.data.current?.sectionId;
    if (!toSectionId) {
      setActiveId(null);
      return;
    }

    // prevent moving if source and target are the same and position is unchanged
    if (fromSectionId === toSectionId && active.id === over.id) {
      setActiveId(null);
      return;
    }

    // find the item in the source section
    const item = sections[fromSectionId].items.find((i) => i.id === active.id);

    setSections((prev) => {
      // remove from old section
      const newFromItems = prev[fromSectionId].items.filter(
        (i) => i.id !== active.id
      );

      // Remove any existing instance in the target section (defensive)
      const filteredToItems = prev[toSectionId].items.filter(
        (i) => i.id !== active.id
      );

      // Find index to insert into new section
      const overIndex = filteredToItems.findIndex((i) => i.id === over.id);
      let newToItems;
      if (overIndex === -1) {
        newToItems = [...filteredToItems, item];
      } else {
        newToItems = [
          ...filteredToItems.slice(0, overIndex),
          item,
          ...filteredToItems.slice(overIndex),
        ];
      }

      return {
        ...prev,
        [fromSectionId]: { ...prev[fromSectionId], items: newFromItems },
        [toSectionId]: { ...prev[toSectionId], items: newToItems },
      };
    });
    setActiveId(null);
  };

  const handleDragEndAdd = (active, over) => {
    setShowModal(true);
    setActiveId(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    // dragging from add button
    if (
      over.id === SectionActions.DROPZONE &&
      active.id === SectionActions.ADD
    ) {
      handleDragEndAdd(active, over);
      return;
    }

    // dragging a section
    if (
      active.data.current?.type === DraggableComponentTypes.SECTION &&
      over.data.current?.type === DraggableComponentTypes.SECTION
    ) {
      handleDragEndSection(active, over);
      return;
    }

    // dragging an item
    if (active.data.current?.type === DraggableComponentTypes.ITEM) {
      handleDragEndItem(active, over);
      return;
    }

    setActiveId(null);
  };

  const handleSaveSection = () => {
    const newKey = `S${Date.now()}`;
    setSections((prev) => ({
      ...prev,
      [newKey]: {
        id: newKey,
        title: pendingSectionTitle,
        items: [],
      },
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
                    items={sections[sectionId].items}
                    title={sections[sectionId].title}
                  />
                ))}
                {activeId == SectionActions.ADD && (
                  <NewSectionDropZone onDrop={handleDragEnd} />
                )}
              </div>
            </SortableContext>
            <AddButton />
            <DragOverlay dropAnimation={null}>
              {activeId === SectionActions.ADD ? (
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
