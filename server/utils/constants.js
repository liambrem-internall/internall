const roomActions = Object.freeze({
  LEAVE: "leave-room",
  JOIN: "join-room",
  USERS: "room-users",
  DISCONNECTING: "disconnecting",
});

const COLORS = [ // array of colors for users
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#a66cff",
  "#ff6f91",
  "#ff9671",
];

const sectionEvents = Object.freeze({
  SECTION_CREATED: "section:created",
  SECTION_UPDATED: "section:updated",
  SECTION_DELETED: "section:deleted",
  SECTION_ORDER_UPDATED: "section:orderUpdated",
})

const itemEvents = Object.freeze({
  ITEM_CREATED: "item:created",
  ITEM_UPDATED: "item:updated",
  ITEM_DELETED: "item:deleted",
  ITEM_ORDER_UPDATED: "item:orderUpdated",
});

const ITEMS_FIELD = "items";

module.exports = { roomActions, COLORS, sectionEvents, itemEvents, ITEMS_FIELD };
