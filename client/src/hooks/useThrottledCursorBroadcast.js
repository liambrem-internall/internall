import { useEffect, useRef } from "react";
import useSafeSocketEmit from "./socketHandlers/useSafeSocketEmit";

const useThrottledCursorBroadcast = ({
  roomId,
  userId,
  color,
  eventType,
  getPosition,
  throttleMs = 33,
  active = true,
}) => {
  const lastCursorPositionRef = useRef({ x: null, y: null });
  const lastEmitTimeRef = useRef(0);
  const safeEmit = useSafeSocketEmit();

  useEffect(() => {
    if (!roomId || !userId || !active) return;
    const handler = (e) => {
      const pos = getPosition(e);
      const now = Date.now();
      if (
        (lastCursorPositionRef.current.x !== pos.x ||
          lastCursorPositionRef.current.y !== pos.y) &&
        now - lastEmitTimeRef.current > throttleMs
      ) {
        safeEmit(eventType, {
          roomId,
          userId,
          color,
          ...pos,
        });
        lastCursorPositionRef.current = { x: pos.x, y: pos.y };
        lastEmitTimeRef.current = now;
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [roomId, userId, color, eventType, throttleMs, active, getPosition, safeEmit]);
};

export default useThrottledCursorBroadcast;