module.exports = (io) => {
  const usersInRoom = {};

  const COLORS = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#A66CFF",
    "#FF6F91",
    "#FF9671",
  ];

const getNextColor = (roomId) => {
  const users = usersInRoom[roomId] ? Object.values(usersInRoom[roomId]) : [];
  for (const color of COLORS) {
    if (!users.some(u => u.color === color)) return color;
  }
  return COLORS[users.length % COLORS.length];
};

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, userId, name }) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
      usersInRoom[roomId][socket.id] = {
        id: userId,
        name,
        color: getNextColor(roomId),
        socketId: socket.id, // unique id for if user opens 2 tabs
      };
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
            io.to(roomId).emit(
              "room-users",
              Object.values(usersInRoom[roomId])
            );
          }
        }
      }
    });
  });
};
