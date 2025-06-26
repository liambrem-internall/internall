import { useState, useEffect, useRef, act } from "react";
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
import DroppableSection from "./Sections/DroppableSection";
import ItemModal from "./Items/ItemModal";
import SectionModal from "./Sections/SectionModal";
import "./SectionList.css";
import {
  DraggableComponentTypes,
  SectionActions,
  DragEndActions,
} from "../../utils/constants";
import customCollisionDetection from "../../utils/customCollisionDetection";

const SectionList = ({ mode }) => {
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

  const findItemBySection = (section) => {
    for (const i of section.items) {
      if (i.id === activeId) {
        return i;
      }
    }

    return null;
  };

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
    const toSectionId = over.data.current?.sectionId || over.id;
    if (!toSectionId) {
      setActiveId(null);
      return;
    }

    if (fromSectionId === toSectionId && active.id === over.id) {
      setActiveId(null);
      return;
    }

    const item = findItemBySection(sections[fromSectionId]);

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

  const handleDragEndDelete = (active, over) => {
    // Delete item
    if (active.data.current?.type === DraggableComponentTypes.ITEM) {
      const fromSectionId = active.data.current.sectionId;
      setSections((prev) => ({
        ...prev,
        [fromSectionId]: {
          ...prev[fromSectionId],
          items: prev[fromSectionId].items.filter((i) => i.id !== active.id),
        },
      }));
    }
    // Delete section
    if (active.data.current?.type === DraggableComponentTypes.SECTION) {
      setSections((prev) => {
        const newSections = { ...prev };
        delete newSections[active.id];
        return newSections;
      });
      setSectionOrder((prev) => prev.filter((id) => id !== active.id));
    }
    setActiveId(null);
    return;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    let actionType = null;

    if (over.id === SectionActions.DELETE_ZONE) {
      actionType = DragEndActions.DELETE;
    } else if (
      over.id === SectionActions.DROPZONE &&
      active.id === SectionActions.ADD
    ) {
      actionType = DragEndActions.ADD_SECTION;
    } else if (
      active.id === SectionActions.ADD &&
      (over.data?.current?.type === DraggableComponentTypes.SECTION ||
        over.data?.current?.type === DraggableComponentTypes.ITEM)
    ) {
      actionType = DragEndActions.ADD_ITEM;
    } else if (
      active.data.current?.type === DraggableComponentTypes.SECTION &&
      over.data.current?.type === DraggableComponentTypes.SECTION
    ) {
      actionType = DragEndActions.MOVE_SECTION;
    } else if (active.data.current?.type === DraggableComponentTypes.ITEM) {
      actionType = DragEndActions.MOVE_ITEM;
    }

    switch (actionType) {
      case DragEndActions.DELETE:
        handleDragEndDelete(active, over);
        break;
      case DragEndActions.ADD_SECTION:
        handleDragEndAdd(active, over);
        break;
      case DragEndActions.ADD_ITEM:
        {
          const sectionId =
            over.data.current.type === DraggableComponentTypes.SECTION
              ? over.id
              : over.data.current.sectionId;
          setTargetSectionId(sectionId);
          setShowItemModal(true);
          setActiveId(null);
        }
        break;
      case DragEndActions.MOVE_SECTION:
        handleDragEndSection(active, over);
        break;
      case DragEndActions.MOVE_ITEM:
        handleDragEndItem(active, over);
        break;
      default:
        setActiveId(null);
    }
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

  const dragOverlayContent = (() => {
    if (activeId === SectionActions.ADD) {
      return <GhostComponent id="new-component-preview" text="New Component" />;
    }
    // for items
    for (const section of Object.values(sections)) {
      let item = findItemBySection(section);

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
                    onItemClick={handleItemClick}
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
