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

  emitSectionDeleted: (roomId, sectionId) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_DELETED, { sectionId });
  },

  emitSectionOrderUpdated: (roomId, order) => {
    if (io) io.to(roomId).emit(sectionEvents.SECTION_ORDER_UPDATED, order);
  }
};