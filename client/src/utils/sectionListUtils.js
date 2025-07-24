import {
  SectionActions,
  DragEndActions,
  DraggableComponentTypes,
} from "./constants";
import { arrayMove } from "@dnd-kit/sortable";
import { addPendingEdit } from "./offlineQueue";

const URL = import.meta.env.VITE_API_URL;

export const findItemBySection = (section, { activeId }) => {
  for (const i of section.items) {
    if (i.id === activeId) {
      return i;
    }
  }
  return null;
};

const handleOfflineEdit = ({
  addPendingEdit,
  addLog,
  edit,
  logMessage,
  setActiveId,
}) => {
  addPendingEdit(edit);
  if (addLog && logMessage) addLog(`(Offline) ${logMessage}`);
  if (setActiveId) setActiveId(null);
};

const handleApiEdit = async ({
  apiFetch,
  endpoint,
  method,
  body,
  getAccessTokenSilently,
  addLog,
  logMessage,
  setActiveId,
}) => {
  await apiFetch({
    endpoint,
    method,
    body,
    getAccessTokenSilently,
  });
  if (addLog && logMessage) addLog(logMessage);
  if (setActiveId) setActiveId(null);
};

const handleDragEndSection = (active, over, params) => {
  const {
    setSectionOrder,
    setActiveId,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
    apiFetch,
    isOnline,
  } = params;

  if (active.id !== over.id) {
    setSectionOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);

      if (!isOnline) {
        handleOfflineEdit({
          addPendingEdit,
          addLog,
          setActiveId,
          edit: {
            type: DraggableComponentTypes.SECTION,
            action: "reorder",
            payload: {
              order: newOrder,
              movedId: active.id,
              username: username,
              isRoomOwner: currentUser?.nickname === username,
            },
            timestamp: Date.now(),
          },
          logMessage: "You moved section",
        });
        return newOrder;
      }

      (async () => {
        await handleApiEdit({
          apiFetch,
          endpoint: `${URL}/api/sections/user/${username}/order`,
          method: "PUT",
          body: {
            order: newOrder,
            username: currentUser?.nickname,
            movedId: active.id,
            isRoomOwner: currentUser?.nickname === username,
          },
          getAccessTokenSilently,
          addLog,
          logMessage: null,
          setActiveId: null,
        });
      })();

      return newOrder;
    });
  }
  setActiveId(null);
};

const handleDragEndItem = (active, over, params) => {
  const {
    setSections,
    setActiveId,
    sections,
    activeId,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
    apiFetch,
    isOnline,
  } = params;

  const fromSectionId = active.data.current.sectionId;
  const toSectionId = over.data.current?.sectionId || over.id;

  if (!toSectionId) {
    setActiveId(null);
    return;
  }

  // reordering within same section
  if (fromSectionId === toSectionId) {
    const items = sections[fromSectionId].items;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    setSections((prev) => ({
      ...prev,
      [fromSectionId]: { ...prev[fromSectionId], items: newItems },
    }));

    const newOrder = newItems.map((i) => i.id);
    const item = findItemBySection(sections[fromSectionId], { activeId });

    if (!isOnline) {
      handleOfflineEdit({
        addPendingEdit,
        addLog,
        setActiveId,
        edit: {
          type: DraggableComponentTypes.ITEM,
          action: "reorder",
          payload: {
            sectionId: fromSectionId,
            order: newOrder,
            username: username,
          },
          timestamp: Date.now(),
        },
        logMessage: `You reordered item "${item?.content}"`,
      });
      return;
    }

    (async () => {
      await handleApiEdit({
        apiFetch,
        endpoint: `${URL}/api/items/${fromSectionId}/items/${username}/order`,
        method: "PUT",
        body: { order: newOrder, username: currentUser?.nickname },
        getAccessTokenSilently,
        addLog,
        logMessage: `You reordered item "${item?.content}"`,
        setActiveId,
      });
    })();

    return;
  }

  // moving to different section
  if (fromSectionId === toSectionId && active.id === over.id) {
    setActiveId(null);
    return;
  }

  const item = findItemBySection(sections[fromSectionId], { activeId });

  setSections((prev) => {
    const newFromItems = prev[fromSectionId].items.filter(
      (i) => i.id !== active.id
    );

    const filteredToItems = prev[toSectionId].items.filter(
      (i) => i.id !== active.id
    );

    const overIndex = filteredToItems.findIndex((i) => i.id === over.id);
    let newToItems;
    if (overIndex === -1) {
      newToItems = [...filteredToItems, item];
    } else {
      newToItems = [
        ...filteredToItems.slice(0, overIndex),
        item,
        ...filteredToItems.slice(overIndex),
      ];
    }

    return {
      ...prev,
      [fromSectionId]: { ...prev[fromSectionId], items: newFromItems },
      [toSectionId]: { ...prev[toSectionId], items: newToItems },
    };
  });

  if (!isOnline) {
    const overIndex = sections[toSectionId].items.findIndex(
      (i) => i.id === over.id
    );
    handleOfflineEdit({
      addPendingEdit,
      addLog,
      setActiveId,
      edit: {
        type: DraggableComponentTypes.ITEM,
        action: "move",
        payload: {
          sectionId: fromSectionId,
          itemId: active.id,
          toSectionId: toSectionId,
          toIndex:
            overIndex === -1 ? sections[toSectionId].items.length : overIndex,
          username: username,
        },
        timestamp: Date.now(),
      },
      logMessage: `You moved item "${item?.content || active.id}"`,
    });
    return;
  }

  (async () => {
    await handleApiEdit({
      apiFetch,
      endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}/move`,
      method: "PUT",
      body: {
        toSectionId,
        username: currentUser?.nickname,
        timestamp: Date.now(),
      },
      getAccessTokenSilently,
      addLog,
      logMessage: `You moved item "${item?.content || active.id}"`,
      setActiveId,
    });
  })();
};

const handleDragEndDelete = (active, over, params) => {
  const {
    setSections,
    sections,
    activeId,
    setSectionOrder,
    setActiveId,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
    apiFetch,
    isOnline,
  } = params;

  // delete item
  if (active.data.current?.type === DraggableComponentTypes.ITEM) {
    const fromSectionId = active.data.current.sectionId;
    const item = findItemBySection(sections[fromSectionId], {
      activeId: active.id,
    });

    setSections((prev) => ({
      ...prev,
      [fromSectionId]: {
        ...prev[fromSectionId],
        items: prev[fromSectionId].items.filter((i) => i.id !== active.id),
      },
    }));

    const logMessage = `You deleted item "${item?.content}"`;

    if (!isOnline) {
      handleOfflineEdit({
        addPendingEdit,
        addLog,
        setActiveId,
        edit: {
          type: DraggableComponentTypes.ITEM,
          action: DragEndActions.DELETE,
          payload: {
            sectionId: fromSectionId,
            itemId: active.id,
            username: username,
          },
          timestamp: Date.now(),
        },
        logMessage: logMessage,
      });
      return;
    }

    (async () => {
      await handleApiEdit({
        apiFetch,
        endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}`,
        method: "DELETE",
        body: { username: currentUser?.nickname },
        getAccessTokenSilently,
        addLog,
        logMessage,
        setActiveId,
      });
    })();
    return;
  }

  // delete section
  if (active.data.current?.type === DraggableComponentTypes.SECTION) {
    const section = sections[active.id];

    setSections((prev) => {
      const newSections = { ...prev };
      delete newSections[active.id];
      return newSections;
    });
    setSectionOrder((prevSectionOrder) => {
      const updatedOrder = prevSectionOrder.filter((id) => id !== active.id);
      return updatedOrder;
    });

    const logMessage = `You deleted section "${section?.title || active.id}"`;

    if (!isOnline) {
      handleOfflineEdit({
        addPendingEdit,
        addLog,
        setActiveId,
        edit: {
          type: DraggableComponentTypes.SECTION,
          action: DragEndActions.DELETE,
          payload: {
            sectionId: active.id,
            username: username,
          },
          timestamp: Date.now(),
        },
        logMessage: logMessage,
      });
      return;
    }

    (async () => {
      await handleApiEdit({
        apiFetch,
        endpoint: `${URL}/api/sections/${active.id}/${username}`,
        method: "DELETE",
        body: { username: currentUser?.nickname },
        getAccessTokenSilently,
        addLog,
        logMessage,
        setActiveId,
      });
    })();
    return;
  }

  setActiveId(null);
};

export const handleDragEnd = (event, params) => {
  const { setActiveId, setShowItemModal, setTargetSectionId } = params;

  const { active, over } = event;
  if (!over) {
    setActiveId(null);
    return;
  }

  let actionType = null;

  if (over.id === SectionActions.DELETE_ZONE) {
    actionType = DragEndActions.DELETE;
  } else if (
    over.id === SectionActions.DROPZONE &&
    active.id === SectionActions.ADD
  ) {
    actionType = DragEndActions.ADD_SECTION;
  } else if (
    active.id === SectionActions.ADD &&
    (over.data?.current?.type === DraggableComponentTypes.SECTION ||
      over.data?.current?.type === DraggableComponentTypes.ITEM)
  ) {
    actionType = DragEndActions.ADD_ITEM;
  } else if (
    active.data.current?.type === DraggableComponentTypes.SECTION &&
    over.data.current?.type === DraggableComponentTypes.SECTION
  ) {
    actionType = DragEndActions.MOVE_SECTION;
  } else if (active.data.current?.type === DraggableComponentTypes.ITEM) {
    actionType = DragEndActions.MOVE_ITEM;
  }

  switch (actionType) {
    case DragEndActions.DELETE:
      handleDragEndDelete(active, over, params);
      break;
    case DragEndActions.ADD_SECTION:
      handleDragEndAdd(active, over, params);
      break;
    case DragEndActions.ADD_ITEM:
      {
        const sectionId =
          over.data.current.type === DraggableComponentTypes.SECTION
            ? over.id
            : over.data.current.sectionId;
        setTargetSectionId(sectionId);
        setShowItemModal(true);
        setActiveId(null);
      }
      break;
    case DragEndActions.MOVE_SECTION:
      handleDragEndSection(active, over, params);
      break;
    case DragEndActions.MOVE_ITEM:
      handleDragEndItem(active, over, params);
      break;
    default:
      setActiveId(null);
  }
};
