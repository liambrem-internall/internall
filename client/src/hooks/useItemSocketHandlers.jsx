import { useEffect } from "react";
import { itemEvents } from "../utils/constants";
import { socket } from "../utils/socket";

const useItemSectionHandlers = ({ setSections, username }) => {
  useEffect(() => {
    const handleItemCreated = (item) => {
      setSections((prev) => {
        const sectionId = item.sectionId;
        if (!prev[sectionId]) return prev;
        if (
          prev[sectionId].items.some(
            (existingItem) => existingItem.id === item.id || existingItem.id === item.id
          )
        ) {
          return prev;
        }
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            items: [...prev[sectionId].items, { ...item, id: item.id }],
          },
        };
      });
    };

    const handleItemUpdated = (item) => {
      setSections((prev) => {
        const newSections = { ...prev };
        for (const sectionId in newSections) {
          newSections[sectionId] = {
            ...newSections[sectionId],
            items: newSections[sectionId].items.filter(
              (existingItem) => existingItem.id !== item.id
            ),
          };
        }
        const destSectionId = item.sectionId;
        if (newSections[destSectionId]) {
          newSections[destSectionId] = {
            ...newSections[destSectionId],
            items: [
              ...newSections[destSectionId].items,
              { ...item, id: item.id },
            ],
          };
        }
        return newSections;
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

export default useItemSectionHandlers;
