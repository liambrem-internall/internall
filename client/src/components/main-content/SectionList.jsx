import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { SectionActions, ViewModes } from "../../utils/constants";
import customCollisionDetection from "../../utils/customCollisionDetection";
import ViewContext from "../../ViewContext";
import { useAuth0 } from "@auth0/auth0-react";
import { apiFetch } from "../../utils/apiFetch";

const URL = import.meta.env.VITE_API_URL;

import {
  handleDragEnd as handleDragEndUtil,
  findItemBySection,
} from "../../utils/sectionListUtils";

const SectionList = () => {
  const { viewMode } = useContext(ViewContext);
  const { username } = useParams();
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [sections, setSections] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState(Object.keys(sections));
  const [showItemModal, setShowItemModal] = useState(false);
  const [isDeleteZoneOver, setIsDeleteZoneOver] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !username) return;
    const fetchSections = async () => {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${URL}/api/sections/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      // convert to object
      const sectionsObj = {};
      const order = [];
      data.forEach((section) => {
        sectionsObj[section._id] = {
          ...section,
          items: (section.items || []).map((item) => ({
            ...item,
            id: item.id || item._id,
          })),
        };
        order.push(section._id);
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
      username: user?.nickname || user?.name || user?.email.split("@")[0],
    });
  };

  const handleSaveSection = async () => {
    const newKey = `S${Date.now()}`;
    const token = await getAccessTokenSilently();
    const response = await fetch(`${URL}/api/sections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: pendingSectionTitle }),
    });
    const newSection = await response.json();

    setSections((prev) => ({
      ...prev,
      [newSection._id]: { ...newSection, items: [] },
    }));
    setSectionOrder((prev) => [...prev, newSection._id]);
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

    const token = await getAccessTokenSilently();

    if (editingItem) {
      const response = await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items/${editingItem.id}`,
        method: "PUT",
        body: { content, link, notes, sectionId: targetSectionId },
        getAccessTokenSilently,
      });
    } else {
      const response = await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items`,
        method: "POST",
        body: { content, link, notes, sectionId: targetSectionId },
        getAccessTokenSilently,
      });

      const newItem = await response;
      setSections((prev) => ({
        ...prev,
        [targetSectionId]: {
          ...prev[targetSectionId],
          items: [
            ...prev[targetSectionId].items,
            { ...newItem, id: newItem._id }, // ensure id is set
          ],
        },
      }));
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
                {sectionOrder.map((sectionId, idx) => (
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
