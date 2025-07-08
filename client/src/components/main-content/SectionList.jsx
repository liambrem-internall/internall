import { useContext, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";
import Container from "react-bootstrap/Container";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import AddButton from "./Add/AddButton";
import ItemModal from "./Items/ItemModal";
import ViewContext from "../../ViewContext";
import { apiFetch } from "../../utils/apiFetch";
import DeleteButton from "./Delete/DeleteButton";
import GhostComponent from "./Add/GhostComponent";
import SectionModal from "./Sections/SectionModal";
import DroppableSection from "./Sections/DroppableSection";
import NewSectionDropZone from "./Sections/NewSectionDropZone";
import useItemSocketHandlers from "../../hooks/useItemSocketHandlers";
import useSectionSocketHandlers from "../../hooks/useSectionSocketHandlers";
import customCollisionDetection from "../../utils/customCollisionDetection";
import { SectionActions, ViewModes } from "../../utils/constants";
import {
  findItemBySection,
  handleDragEnd as handleDragEndUtil,
} from "../../utils/sectionListUtils";

import "./SectionList.css";

const URL = import.meta.env.VITE_API_URL;

const SectionList = () => {
  const { viewMode } = useContext(ViewContext);
  const { username } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [sections, setSections] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState(Object.keys(sections));
  const [showItemModal, setShowItemModal] = useState(false);
  const [isDeleteZoneOver, setIsDeleteZoneOver] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useSectionSocketHandlers({ setSections, setSectionOrder, username });
  useItemSocketHandlers({ setSections, setSectionOrder, username });

  useEffect(() => {
    if (!isAuthenticated || !username) return;
    const fetchSections = async () => {
      const data = await apiFetch({
        endpoint: `${URL}/api/sections/user/${username}`,
        getAccessTokenSilently,
      });

      // convert to object
      const sectionsObj = {};
      const order = [];
      data.forEach((section) => {
        const { _id, items = [], ...rest } = section;
        const id = _id;
        sectionsObj[id] = {
          ...rest,
          id,
          items: items.map(({ _id: itemId, ...itemRest }) => ({
            ...itemRest,
            id: itemId,
          })),
        };
        order.push(id);
      });
      setSections(sectionsObj);
      setSectionOrder(order);
    };
    fetchSections();
  }, [getAccessTokenSilently, isAuthenticated, username]);

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
      getAccessTokenSilently,
      username,
    });
  };

  const handleSaveSection = async () => {
    const newSection = await apiFetch({
      endpoint: `${URL}/api/sections/${username}`,
      method: "POST",
      body: { title: pendingSectionTitle },
      getAccessTokenSilently,
    });

    const sectionId = newSection.id;

    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...newSection, id: sectionId, items: [] },
    }));
    setSectionOrder((prev) => [...prev, sectionId]);
    setShowModal(false);
    setPendingSectionTitle("");
  };

  const handleSaveItem = async ({ content, link, notes }) => {
    if (!content.trim() || !targetSectionId) {
      setShowItemModal(false);
      setEditingItem(null);
      setTargetSectionId(null);
      return;
    }

    if (editingItem) {
      await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items/${editingItem.id}/${username}`,
        method: "PUT",
        body: { content, link, notes, sectionId: targetSectionId },
        getAccessTokenSilently,
      });
    } else {
      await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items/${username}`,
        method: "POST",
        body: { content, link, notes, sectionId: targetSectionId },
        getAccessTokenSilently,
      });
    }

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
    viewMode === ViewModes.LIST
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
      <Container className="section-list-container">
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
                  viewMode === ViewModes.LIST ? "list-view" : "board-view"
                }`}
              >
                {sectionOrder.map((sectionId) => (
                  <DroppableSection
                    key={sectionId}
                    id={sectionId}
                    items={sections[sectionId].items}
                    title={sections[sectionId].title}
                    onItemClick={handleItemClick}
                    className={`section ${
                      viewMode === ViewModes.LIST ? "list-view" : "board-view"
                    }`}
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
