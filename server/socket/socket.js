module.exports = (io) => {
  const usersInRoom = {};

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId }) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
      usersInRoom[roomId][socket.id] = userId;
      io.to(roomId).emit("room-users", Object.values(usersInRoom[roomId]));
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      if (usersInRoom[roomId]) {
        delete usersInRoom[roomId][socket.id];
        if (Object.keys(usersInRoom[roomId]).length === 0) {
          delete usersInRoom[roomId];
        } else {
          io.to(roomId).emit("room-users", Object.values(usersInRoom[roomId]));
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
            io.to(roomId).emit("room-users", Object.values(usersInRoom[roomId]));
          }
        }
      }
    });
  });
};