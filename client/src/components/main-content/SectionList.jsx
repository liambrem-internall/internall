import { useContext, useEffect, useState, useRef } from "react";

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
import Logs from "./Logs/logs";
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
import useRoomUserrs from "../../hooks/useRoomUsers";
import useRoomCursors from "../../hooks/useRoomCursors";
import useBroadcastCursor from "../../hooks/useBroadcastCursor";
import useRoomEditing from "../../hooks/useRoomEditing";
import useRemoteDrags from "../../hooks/useRemoteDrags";
import useDragHandlers from "../../hooks/useDragHandlers";
import useSaveHandlers from "../../hooks/useSaveHandlers";
import useThrottledCursorBroadcast from "../../hooks/useThrottledCursorBroadcast";
import customCollisionDetection from "../../utils/customCollisionDetection";
import {
  cursorEvents,
  DraggableComponentTypes,
  SectionActions,
  ViewModes,
} from "../../utils/constants";
import {
  findItemBySection,
  handleDragEnd as handleDragEndUtil,
} from "../../utils/sectionListUtils";
import { CursorArrowMoveOutline24 } from "metau-meta-icons";
import { socket } from "../../utils/socket";

import "./SectionList.css";

const URL = import.meta.env.VITE_API_URL;

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
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const activeIdRef = useRef(null);
  const roomId = username;
  const editingUsers = useRoomEditing(roomId);
  const allUsers = useRoomUserrs(roomId, null);

  const userId = user?.sub;
  const currentUser = allUsers?.find((u) => u.id === userId);
  const color = currentUser?.color || "#000"; // fallback color if not found

  const addLog = (msg) => {
    setLogs((prev) => [...prev.slice(-49), msg]); // keep last 50 logs
  };

  useSectionSocketHandlers({
    setSections,
    setSectionOrder,
    username: currentUser?.nickname,
    addLog,
  });
  useItemSocketHandlers({
    setSections,
    setSectionOrder,
    username: currentUser?.nickname,
    addLog,
  });

  useBroadcastCursor(roomId, userId, color);
  const cursors = useRoomCursors(roomId, userId);
  const remoteDrags = useRemoteDrags(roomId, userId);

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

  // for regular cursor movement
  useThrottledCursorBroadcast({
    roomId,
    userId,
    color,
    eventType: cursorEvents.CURSOR_MOVE,
    getPosition: (e) => ({ x: e.clientX, y: e.clientY }),
    throttleMs: 33,
    active: true,
  });

  // for dragging
  useThrottledCursorBroadcast({
    roomId,
    userId,
    color,
    eventType: cursorEvents.COMPONENT_DRAG_MOVE,
    getPosition: (e) => ({
      x: e.clientX,
      y: e.clientY,
      id: activeIdRef.current,
    }),
    throttleMs: 33,
    active: isDragging,
  });

  // const lastCursorPositionRef = useRef({ x: null, y: null });
  // let lastEmitTimeRef = useRef(0);

  // const handleMouseMoveWhileDragging = (e) => {
  //   useThrottledCursorBroadcast({
  //     roomId,
  //     userId,
  //     color,
  //     eventType: cursorEvents.COMPONENT_DRAG_MOVE,
  //     getPosition: (e) => ({
  //       x: e.clientX,
  //       y: e.clientY,
  //       id: activeIdRef.current,
  //     }),
  //     throttleMs: 33,
  //     active: isDragging, // set this based on your drag state
  //   });
  // };

  const dragHandlers = useDragHandlers({
    setActiveId,
    activeId,
    activeIdRef,
    setShowModal,
    setShowItemModal,
    setTargetSectionId,
    setSections,
    setSectionOrder,
    sections,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
    userId,
    color,
    roomId,
    setDragPosition,
    socket,
    cursorEvents,
    handleDragEndUtil,
    setIsDeleteZoneOver,
    setIsDragging,
  });

  const saveHandlers = useSaveHandlers({
    setShowModal,
    setShowItemModal,
    setTargetSectionId,
    setSections,
    setSectionOrder,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
    setPendingSectionTitle,
    pendingSectionTitle,
    editingItem,
    setEditingItem,
    targetSectionId,
    apiFetch,
  });

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

  const remoteDragContent = Object.values(remoteDrags).map((drag) => {
    let content = null;
    let isSection = false;
    if (drag.type === DraggableComponentTypes.SECTION && sections[drag.id]) {
      content = sections[drag.id].title;
      isSection = true;
    } else if (drag.type === DraggableComponentTypes.ITEM) {
      for (const section of Object.values(sections)) {
        const item = section.items.find((i) => i.id === drag.id); // find item in section
        if (item) {
          content = item.content;
          break;
        }
      }
    }
    if (!content) return null;

    return (
      <div
        key={drag.userId}
        style={{
          position: "fixed",
          left: drag.x,
          top: drag.y,
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0.7,
          color: drag.color,
          fontWeight: "bold",
          transform: "translate(-50%, -50%)",
          transition: "left 0.05s, top 0.05s",
        }}
      >
        <div
          style={{
            minWidth: 150,
            padding: isSection ? "24px 32px" : "12px 24px",
            background: isSection ? "var(--dark2)" : "#25242d",
            borderRadius: isSection ? 12 : 8,
            boxShadow: isSection
              ? "0 2px 12px rgba(0,0,0,0.14)"
              : "0 2px 8px rgba(0,0,0,0.12)",
            opacity: 0.7,
            fontWeight: isSection ? 600 : 500,
            color: "white",
            fontSize: isSection ? 20 : undefined,
            border: `4px solid ${drag.color}`,
            transform: "scale(1)",
            transition: "transform 0.1s, opacity 0.1s",
          }}
        >
          {content}
        </div>
      </div>
    );
  });

  return (
    <>
      <Container className="section-list-container">
        <div className="sections-scroll-container">
          <DndContext
            onDragStart={dragHandlers.handleDragStart}
            onDragEnd={dragHandlers.handleDragEnd}
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
                    editingUsers={editingUsers}
                    users={allUsers}
                    currentUserId={userId}
                  />
                ))}
                {activeId == SectionActions.ADD && (
                  <NewSectionDropZone onDrop={dragHandlers.handleDragEnd} />
                )}
              </div>
            </SortableContext>
            <div className="bottom-row">
              <DeleteButton />
              <Logs logs={logs} />
              <AddButton />
            </div>
            <DragOverlay dropAnimation={null}>{dragOverlayContent}</DragOverlay>
            <div>{remoteDragContent}</div>
          </DndContext>
        </div>
      </Container>
      <SectionModal
        show={showModal}
        onHide={handleCloseModal}
        pendingSectionTitle={pendingSectionTitle}
        setPendingSectionTitle={setPendingSectionTitle}
        handleSaveSection={saveHandlers.handleSaveSection}
      />
      <ItemModal
        show={showItemModal}
        onHide={() => {
          setShowItemModal(false);
          setEditingItem(null);
        }}
        handleSaveItem={saveHandlers.handleSaveItem}
        initialContent={editingItem?.content || ""}
        initialLink={editingItem?.link || ""}
        initialNotes={editingItem?.notes || ""}
        itemId={editingItem?.id}
      />
      {Object.entries(cursors).map(([uid, { color, x, y }]) => (
        <div
          key={uid}
          style={{
            position: "fixed",
            left: x,
            top: y,
            pointerEvents: "none",
            zIndex: 9999,
            color,
            fontWeight: "bold",
            transition: "left 0.05s, top 0.05s",
          }}
        >
          <svg width="24" height="24">
            <CursorArrowMoveOutline24 />
          </svg>
        </div>
      ))}
    </>
  );
};

export default SectionList;
