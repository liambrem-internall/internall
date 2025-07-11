import {
  SectionActions,
  DragEndActions,
  DraggableComponentTypes,
} from "./constants";
import { arrayMove } from "@dnd-kit/sortable";
import { apiFetch } from "./apiFetch";

export const findItemBySection = (section, { activeId }) => {
  for (const i of section.items) {
    if (i.id === activeId) {
      return i;
    }
  }
  return null;
};

const URL = import.meta.env.VITE_API_URL;

const handleDragEndSection = (
  active,
  over,
  { setSectionOrder, setActiveId, getAccessTokenSilently, username, currentUser, addLog }
) => {
  if (active.id !== over.id) {
    setSectionOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);

      (async () => {
        await apiFetch({
          endpoint: `${URL}/api/sections/user/${username}/order`,
          method: "PUT",
          body: { order: newOrder, username: currentUser?.nickname, movedId: active.id },
          getAccessTokenSilently,
        });
      })();

      return newOrder;
    });
  }
  setActiveId(null);
};

const handleDragEndItem = (
  active,
  over,
  { setSections, setActiveId, sections, activeId, getAccessTokenSilently, username, currentUser, addLog }
) => {
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

  (async () => {
    await apiFetch({
      endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}/move`,
      method: "PUT",
      body: { toSectionId, username: currentUser?.nickname },
      getAccessTokenSilently,
    });
  })();

  if (addLog) {
    addLog(`You moved item "${item?.content || active.id}"`);
  }

  setActiveId(null);
};

const handleDragEndAdd = (active, over, { setShowModal, setActiveId, currentUser, addLog }) => {
  setShowModal(true);
  setActiveId(null);
};

const handleDragEndDelete = (
  active,
  over,
  { setSections, sections, activeId, setSectionOrder, setActiveId, getAccessTokenSilently, username, currentUser, addLog }
) => {
  // Delete item
  if (active.data.current?.type === DraggableComponentTypes.ITEM) {
    const fromSectionId = active.data.current.sectionId;
    setSections((prev) => ({
      ...prev,
      [fromSectionId]: {
        ...prev[fromSectionId],
        items: prev[fromSectionId].items.filter((i) => i.id !== active.id),
      },
    }));
    (async () => {
      await apiFetch({
        endpoint: `${URL}/api/items/${fromSectionId}/items/${active.id}/${username}`,
        method: "DELETE",
        body: { username: currentUser?.nickname },
        getAccessTokenSilently,
      });
    })();

    if (addLog) {
      const item = findItemBySection(sections[fromSectionId], { activeId });
      addLog(`You deleted item "${item?.content}"`);
    }
  }
  // Delete section
  if (active.data.current?.type === DraggableComponentTypes.SECTION) {
    setSections((prev) => {
      const newSections = { ...prev };
      delete newSections[active.id];

      (async () => {
        await apiFetch({
          endpoint: `${URL}/api/sections/${active.id}/${username}`,
          method: "DELETE",
          body: { username: currentUser?.nickname },
          getAccessTokenSilently,
        });
      })();
      return newSections;
    });
    setSectionOrder((prevSectionOrder) => {
      const updatedOrder = prevSectionOrder.filter((id) => id !== active.id); // remove deleted section ids
      return updatedOrder;
    });
    if (addLog) {
      const section = sections[active.id];
  addLog(`You deleted section "${section?.title || active.id}"`);
    }
  }
  setActiveId(null);
  return;
};

export const handleDragEnd = (
  event,
  {
    setActiveId,
    activeId,
    setShowModal,
    setShowItemModal,
    setTargetSectionId,
    setSections,
    setSectionOrder,
    sections,
    getAccessTokenSilently,
    username,
    currentUser,
    addLog,
  }
) => {
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
      handleDragEndDelete(active, over, {
        setSections,
        sections,
        setSectionOrder,
        setActiveId,
        getAccessTokenSilently,
        username,
        currentUser,
        addLog,
        activeId,
      });
      break;
    case DragEndActions.ADD_SECTION:
      handleDragEndAdd(active, over, {
        setShowModal,
        setActiveId,
        currentUser,
        addLog,
      });
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
      handleDragEndSection(active, over, {
        setSectionOrder,
        setActiveId,
        getAccessTokenSilently,
        username,
        currentUser,
        addLog,
      });
      break;
    case DragEndActions.MOVE_ITEM:
      handleDragEndItem(active, over, {
        setSections,
        setActiveId,
        sections,
        activeId,
        getAccessTokenSilently,
        username,
        currentUser,
        addLog,
      });
      break;
    default:
      setActiveId(null);
  }
};
