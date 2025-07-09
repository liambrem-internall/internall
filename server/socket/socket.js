const { roomActions, COLORS } = require("../utils/constants");

const rooms = require("./rooms");
const socketUI = require("./socketUI");

module.exports = (io) => {
  const usersInRoom = {};

  io.on("connection", (socket) => {
    rooms(io, socket, usersInRoom);
    socketUI(io, socket, usersInRoom);
  });
};
