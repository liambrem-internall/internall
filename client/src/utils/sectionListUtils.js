import {
  SectionActions,
  DragEndActions,
  DraggableComponentTypes,
} from "./constants";
import { arrayMove } from "@dnd-kit/sortable";

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
  { setSectionOrder, setActiveId, getAccessTokenSilently, username }
) => {
  if (active.id !== over.id) {
    setSectionOrder((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);

      // update backend:
      (async () => {
        const token = await getAccessTokenSilently();
        await fetch(`${URL}/api/users/${username}/sections/order`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order: newOrder }),
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
  { setSections, setActiveId, sections, activeId, getAccessTokenSilently }
) => {
  const fromSectionId = active.data.current.sectionId;
  const toSectionId = over.data.current?.sectionId || over.id;
  if (!toSectionId) {
    setActiveId(null);
    return;
  }

  if (fromSectionId === toSectionId && active.id === over.id) {
    setActiveId(null);
    return;
  }

  const item = findItemBySection(sections[fromSectionId], { activeId });

  setSections((prev) => {
    // remove from old section
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
    const token = await getAccessTokenSilently();
    // Remove from old section
    await fetch(`${URL}/api/items/${fromSectionId}/items/${active.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Add to new section
    await fetch(`${URL}/api/items/${toSectionId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
  })();

  setActiveId(null);
};

const handleDragEndAdd = (
  active,
  over,
  { setShowModal, setActiveId, getAccessTokenSilently }
) => {
  setShowModal(true);
  setActiveId(null);
};

const handleDragEndDelete = (
  active,
  over,
  { setSections, setSectionOrder, setActiveId, getAccessTokenSilently }
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
      const token = await getAccessTokenSilently();
      await fetch(`${URL}/api/items/${fromSectionId}/items/${active.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    })();
  }
  // Delete section
  if (active.data.current?.type === DraggableComponentTypes.SECTION) {
    setSections((prev) => {
      const newSections = { ...prev };
      delete newSections[active.id];

      // delete in backend:
      (async () => {
        const token = await getAccessTokenSilently();
        await fetch(`${URL}/api/sections/${active.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })();
      return newSections;
    });
    setSectionOrder((prevSectionOrder) => {
      const updatedOrder = prevSectionOrder.filter((id) => id !== active.id); // remove deleted section ids
      return updatedOrder;
    });
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
        setSectionOrder,
        setActiveId,
        getAccessTokenSilently,
      });
      break;
    case DragEndActions.ADD_SECTION:
      handleDragEndAdd(active, over, {
        setShowModal,
        setActiveId,
        getAccessTokenSilently,
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
      });
      break;
    case DragEndActions.MOVE_ITEM:
      handleDragEndItem(active, over, {
        setSections,
        setActiveId,
        sections,
        activeId,
        getAccessTokenSilently,
      });
      break;
    default:
      setActiveId(null);
  }
};
