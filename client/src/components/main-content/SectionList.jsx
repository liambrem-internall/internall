import { useContext, useEffect, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";
import Container from "react-bootstrap/Container";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import Logs from "./Logs/logs";
import AddButton from "./Add/AddButton";
import ItemModal from "./Items/ItemModal";
import ViewContext from "../../ViewContext";
import { socket } from "../../utils/socket";
import { apiFetch } from "../../utils/apiFetch";
import DeleteButton from "./Delete/DeleteButton";
import SectionModal from "./Sections/SectionModal";
import useRoomUsers from "../../hooks/rooms/useRoomUsers";
import useDragHandlers from "../../hooks/useDragHandlers";
import useSaveHandlers from "../../hooks/useSaveHandlers";
import DroppableSection from "./Sections/DroppableSection";
import CursorOverlay from "./SectionListComponents/CursorOverlay";
import RemoteDragContent from "./SectionListComponents/RemoteDragContent";
import DragOverlayContent from "./SectionListComponents/DragOverlayContent";
import useRoomCursors from "../../hooks/rooms/useRoomCursors";
import useRoomEditing from "../../hooks/rooms/useRoomEditing";
import useLogs from "../../hooks/useLogs";
import useSectionListState from "../../hooks/useSectionListState";
import NewSectionDropZone from "./Sections/NewSectionDropZone";
import customCollisionDetection from "../../utils/customCollisionDetection";
import useThrottledCursorBroadcast from "../../hooks/useThrottledCursorBroadcast";
import useItemSocketHandlers from "../../hooks/socketHandlers/useItemSocketHandlers";
import useSectionSocketHandlers from "../../hooks/socketHandlers/useSectionSocketHandlers";
import { handleDragEnd as handleDragEndUtil } from "../../utils/sectionListUtils";
import {
  cursorEvents,
  DraggableComponentTypes,
  SectionActions,
  THROTTLE_MS,
  ViewModes,
} from "../../utils/constants";

import "./SectionList.css";

const URL = import.meta.env.VITE_API_URL;

const SectionList = () => {

  const {
    sectionState: { sections, setSections, sectionOrder, setSectionOrder },
    modalState: { showModal, setShowModal, showItemModal, setShowItemModal, pendingSectionTitle, setPendingSectionTitle },
    editingState: { targetSectionId, setTargetSectionId, editingItem, setEditingItem },
    dragState: { activeId, setActiveId, isDragging, setIsDragging, isDeleteZoneOver, setIsDeleteZoneOver, dragPosition, setDragPosition, activeIdRef },
  } = useSectionListState();

  const { viewMode } = useContext(ViewContext);
  const { username } = useParams();
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  
  const roomId = username;
  const editingUsers = useRoomEditing(roomId);
  const allUsers = useRoomUsers(roomId, null);

  const userId = user?.sub;
  const currentUser = allUsers?.find((u) => u.id === userId);
  const color = currentUser?.color || "#000"; // fallback color if not found
  const { logs, addLog } = useLogs();

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

  const cursors = useRoomCursors(roomId, userId);

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
    throttleMs: THROTTLE_MS,
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
    throttleMs: THROTTLE_MS,
    active: isDragging,
  });

  const dragHandlers = useDragHandlers(
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
    setIsDragging
  );

  const saveHandlers = useSaveHandlers(
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
    apiFetch
  );

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
            <DragOverlay dropAnimation={null}>
              <DragOverlayContent
                sections={sections}
                activeId={activeId}
                isDeleteZoneOver={isDeleteZoneOver}
              />
            </DragOverlay>
            <RemoteDragContent
              roomId={roomId}
              userId={userId}
              sections={sections}
            />
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
      <CursorOverlay cursors={cursors} />
    </>
  );
};

export default SectionList;
