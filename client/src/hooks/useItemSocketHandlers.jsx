import { useEffect } from "react";
import { itemEvents } from "../utils/constants";
import { socket } from "../utils/socket";

const useItemSocketHandlers = ({ setSections, username }) => {
  useEffect(() => {
    const handleItemCreated = (item) => {
      setSections((prev) => {
        const sectionId = item.sectionId;
        if (!prev[sectionId]) return prev;
        if (
          prev[sectionId].items.some(
            (existingItem) => existingItem.id === item.id
          )
        ) {
          return prev;
        }
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            items: [...prev[sectionId].items, { item, id: item.id }],
          },
        };
      });
    };

    const handleItemUpdated = (item) => {
      const normalizedItem = {
        ...item,
        id: (item.id || item._id)?.toString(),
        sectionId: item.sectionId?.toString(),
      };
      const destSectionId = normalizedItem.sectionId;

      setSections((prev) => {
        // if item is moving between sections
        const sourceSectionId = Object.entries(prev).find(
          ([sectionId, section]) =>
            sectionId !== destSectionId &&
            section.items.some((i) => i.id === normalizedItem.id)
        )?.[0];

        if (sourceSectionId) {
          return {
            ...prev,
            [sourceSectionId]: {
              ...prev[sourceSectionId],
              items: prev[sourceSectionId].items.filter(
                (i) => i.id !== normalizedItem.id
              ),
            },
            [destSectionId]: {
              ...prev[destSectionId],
              items: [...prev[destSectionId].items, normalizedItem],
            },
          };
        } else {
          // update item in the same section
          return {
            ...prev,
            [destSectionId]: {
              ...prev[destSectionId],
              items: prev[destSectionId].items.map((i) =>
                i.id === normalizedItem.id ? { ...i, ...normalizedItem } : i
              ),
            },
          };
        }
      });
    };
    const handleItemDeleted = ({ itemId }) => {
      setSections((prev) => {
        const newSections = { ...prev };
        for (const sectionId in newSections) {
          newSections[sectionId] = {
            ...newSections[sectionId],
            items: newSections[sectionId].items.filter(
              (existingItem) => existingItem.id !== itemId
            ),
          };
        }
        return newSections;
      });
    };

    const handleItemOrderUpdated = ({ sectionId, order }) => {
      setSections((prev) => {
        if (!prev[sectionId]) return prev;
        const itemsById = {};
        prev[sectionId].items.forEach((item) => {
          itemsById[item.id] = item;
        });
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            items: order.map((id) => itemsById[id]).filter(Boolean),
          },
        };
      });
    };

    socket.on(itemEvents.ITEM_CREATED, handleItemCreated);
    socket.on(itemEvents.ITEM_UPDATED, handleItemUpdated);
    socket.on(itemEvents.ITEM_DELETED, handleItemDeleted);
    socket.on(itemEvents.ITEM_ORDER_UPDATED, handleItemOrderUpdated);

    return () => {
      socket.off(itemEvents.ITEM_CREATED, handleItemCreated);
      socket.off(itemEvents.ITEM_UPDATED, handleItemUpdated);
      socket.off(itemEvents.ITEM_DELETED, handleItemDeleted);
      socket.off(itemEvents.ITEM_ORDER_UPDATED, handleItemOrderUpdated);
    };
  }, [setSections, username]);
};

export default useItemSocketHandlers;
