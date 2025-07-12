import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { cursorEvents } from "../utils/constants";

const useRemoteDrags = (roomId, userId) => {
  const [remoteDrags, setRemoteDrags] = useState({});

  useEffect(() => {
    if (!roomId) return;

    const handleDragStart = (data) => {
      if (data.userId !== userId) {
        setRemoteDrags((prev) => ({
          ...prev,
          [data.userId]: { ...data, dragging: true },
        }));
      }
    };

    const handleDragMove = (data) => {
      if (data.userId !== userId) {
        setRemoteDrags((prev) => ({
          ...prev,
          [data.userId]: { ...prev[data.userId], ...data },
        }));
      }
    };

    const handleDragEnd = (data) => {
      if (data.userId !== userId) {
        setRemoteDrags((prev) => {
          const copy = { ...prev };
          delete copy[data.userId];
          return copy;
        });
      }
    };

    socket.on(cursorEvents.COMPONENT_DRAG_START, handleDragStart);
    socket.on(cursorEvents.COMPONENT_DRAG_MOVE, handleDragMove);
    socket.on(cursorEvents.COMPONENT_DRAG_END, handleDragEnd);

    return () => {
      socket.off(cursorEvents.COMPONENT_DRAG_START, handleDragStart);
      socket.off(cursorEvents.COMPONENT_DRAG_MOVE, handleDragMove);
      socket.off(cursorEvents.COMPONENT_DRAG_END, handleDragEnd);
    };
  }, [roomId, userId]);

  return remoteDrags;
};

export default useRemoteDrags;