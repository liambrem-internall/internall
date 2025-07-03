const { roomActions, COLORS } = require("../utils/constants");

const rooms = require("./rooms");

module.exports = (io) => {
  const usersInRoom = {};

  io.on("connection", (socket) => {
    rooms(io, socket, usersInRoom);
  });
};
