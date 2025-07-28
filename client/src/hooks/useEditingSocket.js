import { useEffect, useRef } from "react";
import { itemEvents } from "../utils/constants";
import useSafeSocketEmit from "./socketHandlers/useSafeSocketEmit";

const useEditingSocket = ({ roomId, userId, itemId, editing, color }) => {
  const prevEditingRef = useRef(false);
  const prevItemIdRef = useRef(null);
  const safeEmit = useSafeSocketEmit();

  useEffect(() => {
    const wasEditing = prevEditingRef.current;
    const prevId = prevItemIdRef.current;

    if (editing && itemId && (!wasEditing || prevId !== itemId)) {
      safeEmit(itemEvents.ITEM_EDITING_START, { roomId, userId, itemId, color });
    }

    if (!editing && wasEditing && prevId) {
      safeEmit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
    }
    prevEditingRef.current = editing;
    prevItemIdRef.current = itemId;
  }, [roomId, userId, itemId, editing, color, safeEmit]);

  useEffect(() => {
    return () => {
      if (prevEditingRef.current && prevItemIdRef.current) {
        safeEmit(itemEvents.ITEM_EDITING_STOP, { roomId, userId });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
};

export default useEditingSocket;