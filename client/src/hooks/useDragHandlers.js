const URL = import.meta.env.VITE_API_URL;
import { SectionActions } from "../utils/constants";

const useDragHandlers = ({
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
}) => {
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
