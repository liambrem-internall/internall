/*
 * Handles room join/leave logic & user tracking
 */

const {
  roomActions,
  COLORS,
} = require("../utils/constants");

module.exports = (io, socket, usersInRoom) => {
  const getNextColor = (roomId) => {
    const users = usersInRoom[roomId] ? Object.values(usersInRoom[roomId]) : [];
    for (const color of COLORS) {
      if (!users.some((user) => user.color === color)) return color;
    }
    return COLORS[users.length % COLORS.length];
  };

  // clean up any existing entries for user before joining
  const cleanupUserEntries = (userId, roomId) => {
    if (!usersInRoom[roomId]) return;
    
    const entries = Object.entries(usersInRoom[roomId]);
    entries.forEach(([socketId, user]) => {
      if (user.id === userId && socketId !== socket.id) {
        delete usersInRoom[roomId][socketId];
      }
    });
  };

  socket.on(roomActions.JOIN, ({ roomId, userId, nickname }) => {
    socket.join(roomId);
    
    // clean up any old entries for user
    cleanupUserEntries(userId, roomId);
    
    if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
    usersInRoom[roomId][socket.id] = {
      id: userId,
      nickname,
      color: getNextColor(roomId),
      socketId: socket.id,
    };
    
    io.to(roomId).emit(roomActions.USERS, Object.values(usersInRoom[roomId]));
  });

  socket.on(roomActions.GET_ROOM_USERS, ({ roomId }) => {
    if (usersInRoom[roomId]) {
      socket.emit(roomActions.USERS, Object.values(usersInRoom[roomId]));
    }
  });

  socket.on(roomActions.LEAVE, ({ roomId }) => {
    socket.leave(roomId);
    if (usersInRoom[roomId]) {
      delete usersInRoom[roomId][socket.id];
      if (Object.keys(usersInRoom[roomId]).length === 0) {
        delete usersInRoom[roomId];
      } else {
        io.to(roomId).emit(
          roomActions.USERS,
          Object.values(usersInRoom[roomId])
        );
      }
    }
  });

  socket.on(roomActions.DISCONNECT, () => {
    Object.keys(usersInRoom).forEach(roomId => {
      if (usersInRoom[roomId] && usersInRoom[roomId][socket.id]) {
        delete usersInRoom[roomId][socket.id];
        if (Object.keys(usersInRoom[roomId]).length === 0) {
          delete usersInRoom[roomId];
        } else {
          io.to(roomId).emit(
            roomActions.USERS,
            Object.values(usersInRoom[roomId])
          );
        }
      }
    });
  });
};
