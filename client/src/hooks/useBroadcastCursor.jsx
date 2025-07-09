import { useEffect } from "react";
import { socket } from "../utils/socket";
import { cursorEvents } from "../utils/constants";

const useBroadcastCursor = (roomId, userId, color) => {
  useEffect(() => {
    if (!roomId || !userId) return;
    const handleMouseMove = (e) => {
      socket.emit(cursorEvents.CURSOR_MOVE, {
        roomId,
        userId,
        color,
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [roomId, userId, color]);
};

export default useBroadcastCursor;