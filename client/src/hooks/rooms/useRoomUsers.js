import { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import { roomActions } from "../../utils/constants";

const useRoomUsers = (roomId, userId = undefined) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const handleUsersUpdate = (userList) => {
      console.log("Room users updated:", userList); // Debug log
      setUsers(userList);
    };

    socket.on(roomActions.USERS, handleUsersUpdate);

    // Request current users when component mounts or roomId changes
    if (socket.connected) {
      socket.emit("get-room-users", { roomId });
    }

    return () => {
      socket.off(roomActions.USERS, handleUsersUpdate);
    };
  }, [roomId]);

  if (userId) {
    // exclude self
    return users.filter((user) => user.id !== userId);
  }
  return users;
};

export default useRoomUsers;