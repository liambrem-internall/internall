const roomActions = Object.freeze({
  LEAVE: "leave-room",
  JOIN: "join-room",
  USERS: "room-users",
  DISCONNECTING: "disconnecting",
});

const COLORS = [
  // array of colors for users
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
});

const itemEvents = Object.freeze({
  ITEM_CREATED: "item:created",
  ITEM_UPDATED: "item:updated",
  ITEM_DELETED: "item:deleted",
  ITEM_ORDER_UPDATED: "item:orderUpdated",
  ITEM_EDITING_START: "item:editing:start",
  ITEM_EDITING_STOP: "item:editing:stop",
  ITEM_EDITING_UPDATE: "item:editing:update",
});

const cursorEvents = Object.freeze({
  CURSOR_MOVE: "cursor-move",
  CURSOR_UPDATE: "cursor-update",
  COMPONENT_DRAG_START: "component:drag:start",
  COMPONENT_DRAG_END: "component:drag:end",
  COMPONENT_DRAG_MOVE: "component:drag:move",
});

const ITEMS_FIELD = "items";

module.exports = {
  roomActions,
  COLORS,
  sectionEvents,
  itemEvents,
  cursorEvents,
  ITEMS_FIELD,
};
