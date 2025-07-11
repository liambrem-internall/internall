import { useEffect } from "react";
import { sectionEvents } from "../utils/constants";
import { socket } from "../utils/socket";

const useSectionSocketHandlers = ({
  setSections,
  setSectionOrder,
  username,
  addLog,
}) => {
  useEffect(() => {
    const handleSectionCreated = (section) => {
      // Skip if this event was triggered by the current user
      if (section.username === username) return;

      const sectionId = section.id || section._id;

      setSections((prev) => ({
        ...prev,
        [sectionId]: { ...section, id: sectionId, items: [] },
      }));
      setSectionOrder((prev) => [...prev, sectionId]);
      if (addLog && section.username && section.username !== username) {
        addLog(
          `${section.username || "Someone"} created section "${section.title}"`
        );
      }
    };

    const handleSectionUpdated = (section) => {
      setSections((prev) => ({
        ...prev,
        [section.id]: { ...prev[section.id], ...section },
      }));
      if (addLog && section.username && section.username !== username) {
        addLog(
          `${section.username || "Someone"} updated section "${section.title}"`
        );
      }
    };

    const handleSectionDeleted = ({ sectionId, username: eventUsername, title }) => {
      setSections((prev) => {
        const copy = { ...prev };
        delete copy[sectionId];
        return copy;
      });
      setSectionOrder((prev) => prev.filter((id) => id !== sectionId));
      if (addLog && eventUsername && eventUsername !== username) {
        addLog(`${eventUsername || "Someone"} deleted section "${title}"`);
      }
    };

    const handleSectionOrderUpdated = ({ order, username: eventUsername, title }) => {
      setSectionOrder(order);
      if (addLog && eventUsername && eventUsername !== username) {
        addLog(`${eventUsername || "Someone"} reordered section ${title}`);
      }
    };

    socket.on(sectionEvents.SECTION_CREATED, handleSectionCreated);
    socket.on(sectionEvents.SECTION_UPDATED, handleSectionUpdated);
    socket.on(sectionEvents.SECTION_DELETED, handleSectionDeleted);
    socket.on(sectionEvents.SECTION_ORDER_UPDATED, handleSectionOrderUpdated);

    return () => {
      socket.off(sectionEvents.SECTION_CREATED, handleSectionCreated);
      socket.off(sectionEvents.SECTION_UPDATED, handleSectionUpdated);
      socket.off(sectionEvents.SECTION_DELETED, handleSectionDeleted);
      socket.off(
        sectionEvents.SECTION_ORDER_UPDATED,
        handleSectionOrderUpdated
      );
    };
  }, [setSections, setSectionOrder, username]);
};

export default useSectionSocketHandlers;
