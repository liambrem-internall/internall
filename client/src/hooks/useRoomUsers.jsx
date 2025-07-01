import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const useRoomUsers = (roomId, userId) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId || !userId) return;
    socket.emit("join-room", { roomId, userId });
    socket.on("room-users", setUsers);
    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("room-users", setUsers);
    };
  }, [roomId, userId]);

  return users.filter((id) => id !== userId);
};

export default useRoomUsers;
