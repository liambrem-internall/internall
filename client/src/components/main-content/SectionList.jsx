import { useState, useContext } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import GhostComponent from "./Add/GhostComponent";
import AddButton from "./Add/AddButton";
import DeleteButton from "./Delete/DeleteButton";
import NewSectionDropZone from "./Sections/NewSectionDropZone";
import Container from "react-bootstrap/Container";
import DroppableSection from "./Sections/DroppableSection";
import ItemModal from "./Items/ItemModal";
import SectionModal from "./Sections/SectionModal";
import "./SectionList.css";
import { SectionActions } from "../../utils/constants";
import customCollisionDetection from "../../utils/customCollisionDetection";
import ViewContext from "../../ViewContext";

import {
  handleDragEnd as handleDragEndUtil,
  findItemBySection,
} from "../../utils/sectionListUtils";

const SectionList = () => {
  const { viewMode } = useContext(ViewContext);
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
  const [isDeleteZoneOver, setIsDeleteZoneOver] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    handleDragEndUtil(event, {
      setActiveId,
      activeId,
      setShowModal,
      setShowItemModal,
      setTargetSectionId,
      setSections,
      setSectionOrder,
      sections,
    });
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

  const handleSaveItem = ({ content, link, notes }) => {
    if (!content.trim() || !targetSectionId) {
      setShowItemModal(false);
      setEditingItem(null);
      setTargetSectionId(null);
      return;
    }

    setSections((prev) => {
      const section = prev[targetSectionId];
      let items;
      if (editingItem) {
        // edit existing item
        items = section.items.map((i) =>
          i.id === editingItem.id ? { ...i, content, link, notes } : i
        );
      } else {
        // add new item
        items = [
          ...section.items,
          {
            id: `${targetSectionId}-${Date.now()}`,
            content,
            link,
            notes,
          },
        ];
      }
      return {
        ...prev,
        [targetSectionId]: {
          ...section,
          items,
        },
      };
    });

    setShowItemModal(false);
    setEditingItem(null);
    setTargetSectionId(null);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsDeleteZoneOver(over?.id === SectionActions.DELETE_ZONE);
  };

  const handleItemClick = (item, sectionId) => {
    setEditingItem(item);
    setTargetSectionId(sectionId);
    setShowItemModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const sortStrategy =
    viewMode === "list"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;

  const dragOverlayContent = (() => {
    if (activeId === SectionActions.ADD) {
      return <GhostComponent id="new-component-preview" text="New Component" />;
    }
    // for items
    for (const section of Object.values(sections)) {
      let item = findItemBySection(section, { activeId });

      if (item) {
        return (
          <div
            style={{
              padding: "12px 24px",
              background: "#25242d",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              opacity: isDeleteZoneOver ? 0.5 : 1,
              fontWeight: 500,
              color: "white",
              border: "4px solid #1f1f1f",
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
            background: "var(--dark2)",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.14)",
            opacity: isDeleteZoneOver ? 0.5 : 1,
            fontWeight: 600,
            color: "white",
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
      <Container className={`section-list-container`}>
        <div className="sections-scroll-container">
          <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={customCollisionDetection}
            onDragOver={handleDragOver}
          >
            <SortableContext items={sectionOrder} strategy={sortStrategy}>
              <div
                className={`sections-row ${
                  viewMode === "list" ? "list-view" : "board-view"
                }`}
              >
                {sectionOrder.map((sectionId, idx) => (
                  <DroppableSection
                    key={sectionId}
                    id={sectionId}
                    items={sections[sectionId].items}
                    title={sections[sectionId].title}
                    onItemClick={handleItemClick}
                    className={`section ${
                      viewMode === "list" ? "list-view" : "board-view"
                    }`}
                    style={{}}
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
      <SectionModal
        show={showModal}
        onHide={handleCloseModal}
        pendingSectionTitle={pendingSectionTitle}
        setPendingSectionTitle={setPendingSectionTitle}
        handleSaveSection={handleSaveSection}
      />
      <ItemModal
        show={showItemModal}
        onHide={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        handleSaveItem={handleSaveItem}
        initialContent={editingItem?.content || ""}
        initialLink={editingItem?.link || ""}
        initialNotes={editingItem?.notes || ""}
      />
    </>
  );
};

export default SectionList;
