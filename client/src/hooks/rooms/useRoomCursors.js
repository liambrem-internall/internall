import { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import { cursorEvents } from "../../utils/constants";

const useRoomCursors = (roomId, userId) => {
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (!roomId) return;
    const handler = ({ userId: uid, color, x, y }) => {
      if (uid !== userId) {
        setCursors((prev) => ({
          ...prev,
          [uid]: { color, x, y },
        }));
      }
    };
    socket.on(cursorEvents.CURSOR_UPDATE, handler);
    return () => socket.off(cursorEvents.CURSOR_UPDATE, handler);
  }, [roomId, userId]);

  return cursors;
};

export default useRoomCursors;