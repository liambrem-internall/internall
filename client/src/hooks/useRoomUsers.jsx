import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { roomActions } from "../utils/constants";

const useRoomUsers = (roomId, userId) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !userId) return;
    socket.on(roomActions.USERS, setUsers);
    return () => {
      socket.off(roomActions.USERS, setUsers);
    };
  }, [roomId, userId]);

  // exclude self
  return users.filter((user) => user.id !== userId);
};

export default useRoomUsers;
