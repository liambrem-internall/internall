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