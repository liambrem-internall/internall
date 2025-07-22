export const SectionActions = Object.freeze({
  ADD: "addSection",
  DROPZONE: "sectionDropzone",
  SECTION: "section",
  DELETE_ZONE: "deleteZone"
});

export const DraggableComponentTypes = Object.freeze({
  SECTION: "section",
  ITEM: "item",
  ADD_NEW: "addNew",
});

export const DragEndActions = Object.freeze({
  ADD_SECTION: "addSection",
  ADD_ITEM: "addItem",
  MOVE_ITEM: "moveItem",
  MOVE_SECTION: "moveSection",
  DELETE: "delete",
});

export const ViewModes = Object.freeze({
  BOARD: "board",
  LIST: "list",
});

export const roomActions = Object.freeze({
  LEAVE: "leave-room",
  JOIN: "join-room",
  USERS: "room-users",
});

export const sectionEvents = Object.freeze({
  SECTION_CREATED: "section:created",
  SECTION_UPDATED: "section:updated",
  SECTION_DELETED: "section:deleted",
  SECTION_ORDER_UPDATED: "section:orderUpdated",
})

export const itemEvents = Object.freeze({
  ITEM_CREATED: "item:created",
  ITEM_UPDATED: "item:updated",
  ITEM_DELETED: "item:deleted",
  ITEM_ORDER_UPDATED: "item:orderUpdated",
  ITEM_EDITING_START: "item:editing:start",
  ITEM_EDITING_STOP: "item:editing:stop",
  ITEM_EDITING_UPDATE: "item:editing:update",
});

export const cursorEvents = Object.freeze({
  CURSOR_MOVE: "cursor-move",
  CURSOR_UPDATE: "cursor-update",
  COMPONENT_DRAG_START: "component:drag:start",
  COMPONENT_DRAG_END: "component:drag:end",
  COMPONENT_DRAG_MOVE: "component:drag:move",
});

const COMPONENT_TYPES = Object.freeze({
  SECTION: "section",
  ITEM: "item",
  WEB: "web",
});

export const THROTTLE_MS = 33;

export const logPageSize = 49;

export const DEBOUNCE_DELAY = 300;