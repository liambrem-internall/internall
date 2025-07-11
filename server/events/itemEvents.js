/*
 * Handles item related socket events
 */

let io = null;
const { itemEvents } = require("../utils/constants");

module.exports = {
  init: (_io) => {
    io = _io;
  },

  emitItemCreated: (roomId, item) => {
    if (io) io.to(roomId).emit(itemEvents.ITEM_CREATED, item);
  },

  emitItemUpdated: (roomId, item) => {
    if (io) io.to(roomId).emit(itemEvents.ITEM_UPDATED, item);
  },

  emitItemDeleted: (roomId, itemId, username, content) => {
    if (io) io.to(roomId).emit(itemEvents.ITEM_DELETED, { itemId, username, content });
  },

  emitItemOrderUpdated: (roomId, sectionId, order, username, content) => {
    if (io)
      io.to(roomId).emit(itemEvents.ITEM_ORDER_UPDATED, {
        sectionId,
        order,
        username,
        content
      });
  },
};
