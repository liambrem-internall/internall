let io = null;

module.exports = {
  init: (_io) => { io = _io; },

  emitSectionCreated: (roomId, section) => {
    console.log("Emitting section creation for room:", roomId, "Section:", section);
    if (io) io.to(roomId).emit("section:created", section);
  },

  emitSectionUpdated: (roomId, section) => {
    if (io) io.to(roomId).emit("section:updated", section);
  },

  emitSectionDeleted: (roomId, sectionId) => {
    console.log("Emitting section deletion for room:", roomId, "Section ID:", sectionId);
    if (io) io.to(roomId).emit("section:deleted", { sectionId });
  },

  emitSectionOrderUpdated: (roomId, order) => {
    console.log("Emitting section order update for room:", roomId, "Order:", order);
    if (io) io.to(roomId).emit("section:orderUpdated", order);
  }
};