const roomActions = Object.freeze({
  LEAVE: "leave-room",
  JOIN: "join-room",
  USERS: "room-users",
});

const COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#a66cff",
  "#ff6F91",
  "#ff9671",
];

const sectionEvents = Object.freeze({
  SECTION_CREATED: "section:created",
  SECTION_UPDATED: "section:updated",
  SECTION_DELETED: "section:deleted",
  SECTION_ORDER_UPDATED: "section:orderUpdated",
})

module.exports = { roomActions, COLORS, sectionEvents };
