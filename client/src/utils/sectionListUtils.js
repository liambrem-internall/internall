import {
  SectionActions,
  DragEndActions,
  DraggableComponentTypes,
} from "./constants";
import { arrayMove } from "@dnd-kit/sortable";
import { addPendingEdit } from "./offlineQueue";

export const findItemBySection = (section, { activeId }) => {
  for (const i of section.items) {
    if (i.id === activeId) {
      return i;
    }
  }
  return null;
};

const URL = import.meta.env.VITE_API_URL;

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

      // check if offline
      if (!isOnline) {
        addPendingEdit({
          type: "section",
          action: "reorder",
          payload: {
            order: newOrder,
            movedId: active.id,
            username: username,
            isRoomOwner: currentUser?.nickname === username,
          },
          timestamp: Date.now(),
        });
        if (addLog) {
          addLog(`(Offline) You moved section`);
        }
        return newOrder;
      }

      (async () => {
        await apiFetch({
          endpoint: `${URL}/api/sections/user/${username}/order`,
          method: "PUT",
          body: {
            order: newOrder,
            username: currentUser?.nickname,
            movedId: active.id,
            isRoomOwner: currentUser?.nickname === username,
          },
          getAccessTokenSilently,
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

    // check if offline
    if (!isOnline) {
      addPendingEdit({
        type: "item",
        action: "reorder",
        payload: {
          sectionId: fromSectionId,
          order: newOrder,
          username: username,
        },
        timestamp: Date.now(), // This is when the user actually made the change
      });

      if (addLog) {
        const item = findItemBySection(sections[fromSectionId], { activeId });
        addLog(`(Offline) You reordered item "${item?.content}"`);
      }
      setActiveId(null);
      return;
    }

    (async () => {
      await apiFetch({
        endpoint: `${URL}/api/items/${fromSectionId}/items/${username}/order`,
        method: "PUT",
        body: { order: newOrder, username: currentUser?.nickname },
        getAccessTokenSilently,
      });
    })();

    if (addLog) {
      const item = findItemBySection(sections[fromSectionId], { activeId });
      addLog(`You reordered item "${item?.content}"`);
    }

    setActiveId(null);
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

  // check if offline
  if (!isOnline) {
    const overIndex = sections[toSectionId].items.findIndex(
      (i) => i.id === over.id
    );
    addPendingEdit({
      type: "item",
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
    });

    if (addLog) {
      addLog(`(Offline) You moved item "${item?.content || active.id}"`);
    }
    setActiveId(null);
    return;
  }

  (async () => {
    await apiFetch({
      endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}/move`,
      method: "PUT",
      body: { 
        toSectionId, 
        username: currentUser?.nickname,
        timestamp: Date.now() 
      },
      getAccessTokenSilently,
    });
  })();

  if (addLog) {
    addLog(`You moved item "${item?.content || active.id}"`);
  }

  setActiveId(null);
};

const handleDragEndAdd = (active, over, params) => {
  const { setShowModal, setActiveId } = params;
  setShowModal(true);
  setActiveId(null);
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

    // check if offline
    if (!isOnline) {
      addPendingEdit({
        type: "item",
        action: "delete",
        payload: {
          sectionId: fromSectionId,
          itemId: active.id,
          username: username,
        },
        timestamp: Date.now(),
      });

      if (addLog) {
        addLog(`(Offline) You deleted item "${item?.content}"`);
      }
      setActiveId(null);
      return;
    }

    (async () => {
      await apiFetch({
        endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}`,
        method: "DELETE",
        body: { username: currentUser?.nickname },
        getAccessTokenSilently,
      });
    })();

    if (addLog) {
      addLog(`You deleted item "${item?.content}"`);
    }
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

    // check if offline
    if (!isOnline) {
      addPendingEdit({
        type: "section",
        action: "delete",
        payload: {
          sectionId: active.id,
          username: username,
        },
        timestamp: Date.now(),
      });

      if (addLog) {
        addLog(
          `(Offline) You deleted section "${section?.title || active.id}"`
        );
      }
      setActiveId(null);
      return;
    }

    (async () => {
      await apiFetch({
        endpoint: `${URL}/api/sections/${active.id}/${username}`,
        method: "DELETE",
        body: { username: currentUser?.nickname },
        getAccessTokenSilently,
      });
    })();

    if (addLog) {
      const section = sections[active.id];
      addLog(`You deleted section "${section?.title || active.id}"`);
    }
  }
  setActiveId(null);
  return;
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
