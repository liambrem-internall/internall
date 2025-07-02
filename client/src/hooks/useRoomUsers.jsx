import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const useRoomUsers = (roomId, userId, nickname) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !userId) return;
    socket.emit("join-room", { roomId, userId, nickname });
    socket.on("room-users", setUsers);
    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("room-users", setUsers);
    };
  }, [roomId, userId, nickname]);

  // Exclude self
  return users.filter((user) => user.id !== userId);
};

export default useRoomUsers;
