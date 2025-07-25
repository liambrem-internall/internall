import { useEffect } from "react";
import { itemEvents } from "../../utils/constants";
import { socket } from "../../utils/socket";

const useItemSocketHandlers = ({ setSections, username, addLog }) => {
  useEffect(() => {
    const handleItemCreated = (item) => {
      const normalizedItem = {
        // normalize item, mongo db passes _id
        ...item,
        id: (item.id || item._id)?.toString(),
        sectionId: item.sectionId?.toString(),
      };
      setSections((prev) => {
        const sectionId = normalizedItem.sectionId;
        if (!prev[sectionId]) return prev;
        if (
          prev[sectionId].items.some(
            (existingItem) => existingItem.id === normalizedItem.id
          )
        ) {
          return prev;
        }
        return {
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            items: [...prev[sectionId].items, normalizedItem],
          },
        };
      });
      if (addLog && item.username !== username) {
        addLog(`${item.username || "Someone"} added item "${item.content}"`);
      }
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
      if (addLog && item.username !== username) {
        addLog(`${item.username || "Someone"} updated item "${item.content}"`);
      }
    };
    const handleItemDeleted = ({
      itemId,
      username: eventUsername,
      content,
    }) => {
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
      if (addLog && eventUsername !== username) {
        addLog(
          `${eventUsername || "Someone"} deleted item "${content || itemId}"`
        );
      }
    };

    const handleItemOrderUpdated = ({
      sectionId,
      order,
      content,
      username: eventUsername,
    }) => {
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
      if (addLog && eventUsername && eventUsername !== username) {
        addLog(
          `${eventUsername || "Someone"} reordered item "${content}"`
        );
      }
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
  }, [setSections, username, addLog]);
};

export default useItemSocketHandlers;
