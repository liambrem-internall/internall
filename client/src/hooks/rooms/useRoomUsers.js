import { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import { roomActions } from "../../utils/constants";

const useRoomUsers = (roomId, userId = undefined) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const handleUsersUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on(roomActions.USERS, handleUsersUpdate);

    if (socket.connected) {
      socket.emit(roomActions.GET_ROOM_USERS, { roomId });
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