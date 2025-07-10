const { itemEvents, cursorEvents } = require("../utils/constants");
const editingUsers = {};

module.exports = (io, socket, usersInRoom) => {
  // item editing
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

  // cursor movement
  socket.on(cursorEvents.CURSOR_MOVE, ({ roomId, userId, color, x, y }) => {
    socket.to(roomId).emit(cursorEvents.CURSOR_UPDATE, { userId, color, x, y });
  });

  socket.on(cursorEvents.COMPONENT_DRAG_START, (data) => {
    socket.to(data.roomId).emit(cursorEvents.COMPONENT_DRAG_START, data);
  });
  socket.on(cursorEvents.COMPONENT_DRAG_MOVE, (data) => {
    socket.to(data.roomId).emit(cursorEvents.COMPONENT_DRAG_MOVE, data);
  });
  socket.on(cursorEvents.COMPONENT_DRAG_END, (data) => {
    socket.to(data.roomId).emit(cursorEvents.COMPONENT_DRAG_END, data);
  });
};
