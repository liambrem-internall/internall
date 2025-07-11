/*
 * Handles section related socket events
 */

let io = null;
const { sectionEvents } = require("../utils/constants");

module.exports = {
  init: (_io) => { io = _io; },

  emitSectionCreated: (roomId, section) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_CREATED, section);
  },

  emitSectionUpdated: (roomId, section) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_UPDATED, section);
  },

  emitSectionDeleted: (roomId, sectionId, username) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_DELETED, { sectionId, username });
  },

  emitSectionOrderUpdated: (roomId, order, username) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_ORDER_UPDATED, { order, username });
  }
};