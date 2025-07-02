import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { roomActions } from "../utils/constants";

const useRoomUsers = (roomId, userId, nickname) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !userId) return;
    socket.emit(roomActions.JOIN, { roomId, userId, nickname });
    socket.on(roomActions.USERS, setUsers);
    return () => {
      socket.emit(roomActions.LEAVE, { roomId });
      socket.off(roomActions.USERS, setUsers);
    };
  }, [roomId, userId, nickname]);

  // exclude self
  return users.filter((user) => user.id !== userId);
};

export default useRoomUsers;
