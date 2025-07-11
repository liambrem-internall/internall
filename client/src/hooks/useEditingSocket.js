import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";
import { itemEvents } from "../utils/constants";

const useEditingSocket = ({ roomId, userId, itemId, editing, color }) => {
  const prevEditingRef = useRef(editing);
  const prevItemIdRef = useRef(itemId);

  useEffect(() => {
    if (editing && itemId && (!prevEditingRef.current || prevItemIdRef.current !== itemId)) {
      socket.emit(itemEvents.ITEM_EDITING_START, { roomId, userId, itemId, color });
    }
    if (!editing && prevEditingRef.current && prevItemIdRef.current) {
      socket.emit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
    }
    prevEditingRef.current = editing;
    prevItemIdRef.current = itemId;

    return () => {
      if (editing && itemId) {
        socket.emit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
      }
    };
  }, [roomId, userId, itemId, editing, color]);
};

export default useEditingSocket;