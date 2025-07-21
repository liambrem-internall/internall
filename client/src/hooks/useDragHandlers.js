const URL = import.meta.env.VITE_API_URL;
import { SectionActions } from "../utils/constants";

/**
 * Custom hook for managing drag-and-drop logic in the SectionList.
 *
 * @param {Function} setActiveId - Set the currently active draggable ID.
 * @param {string} activeId - The currently active draggable ID.
 * @param {Object} activeIdRef - Ref for the active draggable ID.
 * @param {Function} setShowModal - Show/hide the section modal.
 * @param {Function} setShowItemModal - Show/hide the item modal.
 * @param {Function} setTargetSectionId - Set the target section for editing.
 * @param {Function} setSections - Update the sections object.
 * @param {Function} setSectionOrder - Update the order of sections.
 * @param {Object} sections - The current sections object.
 * @param {Function} getAccessTokenSilently - Auth0 token fetcher for API calls.
 * @param {string} username - Current user's username.
 * @param {Object} currentUser - Current user object.
 * @param {Function} addLog - Function to add a log entry.
 * @param {string} userId - Current user's ID.
 * @param {string} color - Current user's color.
 * @param {string} roomId - Current room ID.
 * @param {Function} setDragPosition - Set drag position for overlays.
 * @param {Object} socket - Socket.io client instance.
 * @param {Object} cursorEvents - Cursor event constants.
 * @param {Function} handleDragEndUtil - Utility function for drag end logic.
 * @param {Function} setIsDeleteZoneOver - Set delete zone hover state.
 * @param {Function} setIsDragging - Set dragging state.
 * @returns {Object} Drag handler functions for DnD context.
 * @example
 * const { handleDragStart, handleDragEnd, handleDragOver } = useDragHandlers(...);
 */

const useDragHandlers = (
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
  apiFetch
) => {
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    activeIdRef.current = event.active.id;
    // initial position
    setDragPosition({
      x: event.activatorEvent?.clientX ?? 0,
      y: event.activatorEvent?.clientY ?? 0,
    });
    socket.emit(cursorEvents.COMPONENT_DRAG_START, {
      roomId,
      userId,
      color,
      id: event.active.id,
      type: event.active.data.current?.type,
    });
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    socket.emit(cursorEvents.COMPONENT_DRAG_END, {
      roomId,
      userId,
      color,
      id: event.active.id,
    });
    if (event.active && event.over && event.active.id !== event.over.id) {
      const section = sections[event.active.id];
      if (section) {
        addLog(`You moved section "${section.title}"`);
      }
    }
    setActiveId(null);
    setIsDragging(false);
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
      currentUser,
      addLog,
      apiFetch,
    });
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsDeleteZoneOver(over?.id === SectionActions.DELETE_ZONE);
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
};

export default useDragHandlers;
