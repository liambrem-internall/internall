const { roomActions, COLORS } = require("../utils/constants");

const rooms = require("./rooms");
const section = require("./section");
const item = require("./item");

module.exports = (io) => {
  const usersInRoom = {};

  io.on("connection", (socket) => {
    rooms(io, socket, usersInRoom);
    section(io, socket, usersInRoom);
    item(io, socket, usersInRoom);
  });
};
