import { useEffect, useRef } from "react";
import { socket } from "../utils/socket";
import { itemEvents } from "../utils/constants";
import useSafeSocketEmit from "./socketHandlers/useSafeSocketEmit";

const useEditingSocket = ({ roomId, userId, itemId, editing, color }) => {
  const prevEditingRef = useRef(editing);
  const prevItemIdRef = useRef(itemId);
  const safeEmit = useSafeSocketEmit();

  useEffect(() => {
    if (editing && itemId && (!prevEditingRef.current || prevItemIdRef.current !== itemId)) {
      safeEmit(itemEvents.ITEM_EDITING_START, { roomId, userId, itemId, color });
    }
    if (!editing && prevEditingRef.current && prevItemIdRef.current) {
      safeEmit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
    }
    prevEditingRef.current = editing;
    prevItemIdRef.current = itemId;

    return () => {
      if (editing && itemId) {
        safeEmit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
      }
    };
  }, [roomId, userId, itemId, editing, color]);
};

export default useEditingSocket;