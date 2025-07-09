import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { roomActions } from "../utils/constants";

const useRoomUsers = (roomId, userId = undefined) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    socket.on(roomActions.USERS, setUsers);
    return () => {
      socket.off(roomActions.USERS, setUsers);
    };
  }, [roomId]);

  if (userId) {
    // exclude self
    return users.filter((user) => user.id !== userId);
  }
  return users;
};

export default useRoomUsers;