const { roomActions, COLORS } = require("../utils/constants");

module.exports = (io) => {
  const usersInRoom = {};

  const getNextColor = (roomId) => {
    const users = usersInRoom[roomId] ? Object.values(usersInRoom[roomId]) : [];
    for (const color of COLORS) {
      if (!users.some((user) => user.color === color)) return color; // if no user currently has this color, return it
    }
    return COLORS[users.length % COLORS.length];
  };

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on(roomActions.JOIN, ({ roomId, userId, name }) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
      usersInRoom[roomId][socket.id] = {
        id: userId,
        name,
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
  });
};
