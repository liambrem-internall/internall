/*
 * Handles room join/leave logic & user tracking
 */

const { roomActions, COLORS, itemEvents } = require("../utils/constants");
const editingUsers = {};

module.exports = (io, socket, usersInRoom) => {
  const getNextColor = (roomId) => {
    const users = usersInRoom[roomId] ? Object.values(usersInRoom[roomId]) : [];
    for (const color of COLORS) {
      if (!users.some((user) => user.color === color)) return color; // if no user currently has this color, return it
    }
    return COLORS[users.length % COLORS.length];
  };

  socket.on(roomActions.JOIN, ({ roomId, userId, nickname }) => {
    socket.join(roomId);
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

  socket.on(roomActions.DISCONNECTING, () => {
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

  socket.on(itemEvents.ITEM_EDITING_START, ({ roomId, userId, itemId }) => {
    if (!editingUsers[roomId]) editingUsers[roomId] = {};
    editingUsers[roomId][userId] = { itemId };
    io.to(roomId).emit(itemEvents.ITEM_EDITING_UPDATE, editingUsers[roomId]);
  });

  socket.on(itemEvents.ITEM_EDITING_STOP, ({ roomId, userId }) => {
    if (editingUsers[roomId]) {
      delete editingUsers[roomId][userId];
      io.to(roomId).emit(itemEvents.ITEM_EDITING_UPDATE, editingUsers[roomId]);
    }
  });
};
