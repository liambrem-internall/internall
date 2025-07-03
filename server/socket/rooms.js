/*
 * Handles room join/leave logic & user tracking
 */

const { roomActions, COLORS } = require("../utils/constants");

module.exports = (io, socket, usersInRoom) => {
  const getNextColor = (roomId) => {
    const users = usersInRoom[roomId] ? Object.values(usersInRoom[roomId]) : [];
    for (const color of COLORS) {
      if (!users.some((user) => user.color === color)) return color; // if no user currently has this color, return it
    }
    return COLORS[users.length % COLORS.length];
  };

  socket.on(roomActions.JOIN, ({ roomId, userId, nickname }) => {
    console.log(`User ${userId} joined room ${roomId}`);
    socket.join(roomId);
    console.log("Sockets in room", roomId, ":", Array.from(io.sockets.adapter.rooms.get(roomId) || []));
    if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
    usersInRoom[roomId][socket.id] = {
      id: userId,
      nickname,
      color: getNextColor(roomId),
      socketId: socket.id, // unique id for each connection (could be multiple per user)
    };
    io.to(roomId).emit(roomActions.USERS, Object.values(usersInRoom[roomId]));
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

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
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
    }
  });
};
