import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { itemEvents } from "../utils/constants";

const useRoomEditing = (roomId) => {
  const [editingUsers, setEditingUsers] = useState({});
  useEffect(() => {
    if (!roomId) return;
    const handler = (data) => setEditingUsers(data);
    socket.on(itemEvents.ITEM_EDITING_UPDATE, handler);
    return () => socket.off(itemEvents.ITEM_EDITING_UPDATE, handler);
  }, [roomId]);
  return editingUsers; // { userId: itemId }
}

export default useRoomEditing;