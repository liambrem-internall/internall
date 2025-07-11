import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";
import { cursorEvents } from "../utils/constants";

const useBroadcastCursor = (roomId, userId, color) => {
  const lastCursorPositionRef = useRef({ x: null, y: null });
  let lastEmitTimeRef = useRef(0);

  useEffect(() => {
    if (!roomId || !userId) return;
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const now = Date.now();
      if (
        (lastCursorPositionRef.current.x !== x || // only emit if cursor position has changed
          lastCursorPositionRef.current.y !== y) &&
        now - lastEmitTimeRef.current > 33 // throttle to roughly 30 FPS
      ) {
        socket.emit(cursorEvents.CURSOR_MOVE, {
          roomId,
          userId,
          color,
          x,
          y,
        });
        lastCursorPositionRef.current = { x, y };
        lastEmitTimeRef.current = now;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [roomId, userId, color]);
};

export default useBroadcastCursor;
