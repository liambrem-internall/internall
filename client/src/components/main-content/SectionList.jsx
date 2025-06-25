import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import GhostComponent from "./Add/GhostComponent";
import AddButton from "./Add/AddButton";
import DeleteButton from "./Delete/DeleteButton";
import NewSectionDropZone from "./Sections/NewSectionDropZone";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DroppableSection from "./Sections/DroppableSection";
import ItemModal from "./Items/ItemModal";
import "./SectionList.css";
import { DraggableComponentTypes, SectionActions } from "../../utils/constants";
import customCollisionDetection from "../../utils/customCollisionDetection";

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

  const [showItemModal, setShowItemModal] = useState(false);
  const [pendingItemContent, setPendingItemContent] = useState("");
  const [targetSectionId, setTargetSectionId] = useState(null);

  const [isDeleteZoneOver, setIsDeleteZoneOver] = useState(false);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEndSection = (active, over) => {
    console.log("active.id", active.id, "over.id", over.id, sectionOrder);
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

    if (fromSectionId === toSectionId && active.id === over.id) {
      setActiveId(null);
      return;
    }

    const item = sections[fromSectionId].items.find((i) => i.id === active.id);

    setSections((prev) => {
      // remove from old section
      const newFromItems = prev[fromSectionId].items.filter(
        (i) => i.id !== active.id
      );

      const filteredToItems = prev[toSectionId].items.filter(
        (i) => i.id !== active.id
      );

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
    // dragging to new section
    if (
      over.id === SectionActions.DROPZONE &&
      active.id === SectionActions.ADD
    ) {
      handleDragEndAdd(active, over);
      return;
    }

    // dragging into existing section or item within section
    if (
      active.id === SectionActions.ADD &&
      (over.data?.current?.type === DraggableComponentTypes.SECTION ||
        over.data?.current?.type === DraggableComponentTypes.ITEM)
    ) {
      // if dropped on an item -> use its sectionId
      const sectionId =
        over.data.current.type === DraggableComponentTypes.SECTION
          ? over.id
          : over.data.current.sectionId;
      console.log("Adding item to section:", sectionId);
      setTargetSectionId(sectionId);
      setShowItemModal(true);
      setActiveId(null);
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

  const handleSaveItem = () => {
    if (!pendingItemContent.trim() || !targetSectionId) {
      setShowItemModal(false);
      setPendingItemContent("");
      setTargetSectionId(null);
      return;
    }
    const newItem = {
      id: `${targetSectionId}-${Date.now()}`,
      content: pendingItemContent,
    };
    setSections((prev) => ({
      ...prev,
      [targetSectionId]: {
        ...prev[targetSectionId],
        items: [...prev[targetSectionId].items, newItem],
      },
    }));
    setShowItemModal(false);
    setPendingItemContent("");
    setTargetSectionId(null);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsDeleteZoneOver(over?.id === "delete-zone");
  };

  const handleCloseModal = () => setShowModal(false);

  const dragOverlayContent = (() => {
    if (activeId === SectionActions.ADD) {
      return <GhostComponent id="new-component-preview" text="New Component" />;
    }
    // for items
    for (const section of Object.values(sections)) {
      const item = section.items.find((i) => i.id === activeId);
      if (item) {
        return (
          <div
            style={{
              padding: "12px 24px",
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              opacity: isDeleteZoneOver ? 0.5 : 1,
              fontWeight: 500,
              transform: isDeleteZoneOver ? "scale(0.75)" : "scale(1)",
              transition: "transform 0.1s, opacity 0.1s",
            }}
          >
            {item.content}
          </div>
        );
      }
    }

    // for sections
    const section = sections[activeId];
    if (section) {
      return (
        <div
          style={{
            minWidth: 200,
            padding: "24px 32px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
            opacity: isDeleteZoneOver ? 0.5 : 1,
            fontWeight: 600,
            fontSize: 20,
            transform: isDeleteZoneOver ? "scale(0.85)" : "scale(1)",
            transition: "transform 0.1s, opacity 0.1s",
          }}
        >
          {section.title}
        </div>
      );
    }
    return null;
  })();

  return (
    <>
      <Container className="section-list-container">
        <div className="sections-scroll-container">
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={customCollisionDetection}
            onDragOver={handleDragOver}
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
            <div className="bottom-row">
              <DeleteButton />
              <AddButton />
            </div>
            <DragOverlay dropAnimation={null}>{dragOverlayContent}</DragOverlay>
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
      <ItemModal
        show={showItemModal}
        onHide={() => setShowItemModal(false)}
        pendingItemContent={pendingItemContent}
        setPendingItemContent={setPendingItemContent}
        handleSaveItem={handleSaveItem}
      />
    </>
  );
};

export default SectionList;
