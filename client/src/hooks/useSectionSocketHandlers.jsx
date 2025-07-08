import { useEffect } from "react";
import { sectionEvents } from "../utils/constants";
import { socket } from "../utils/socket";

const useSectionSocketHandlers = ({
  setSections,
  setSectionOrder,
  username,
}) => {
  useEffect(() => {
    const handleSectionCreated = (section) => {
      setSections((prev) => ({
        ...prev,
        [section.id]: { ...section, id: section.id, items: [] },
      }));
      setSectionOrder((prev) => [...prev, section.id]);
    };

    const handleSectionUpdated = (section) => {
      setSections((prev) => ({
        ...prev,
        [section.id]: { ...prev[section.id], ...section },
      }));
    };

    const handleSectionDeleted = ({ sectionId }) => {
      setSections((prev) => {
        const copy = { ...prev };
        delete copy[sectionId];
        return copy;
      });
      setSectionOrder((prev) => prev.filter((id) => id !== sectionId));
    };

    const handleSectionOrderUpdated = (order) => {
      setSectionOrder(order);
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
