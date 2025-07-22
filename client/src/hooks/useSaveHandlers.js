const URL = import.meta.env.VITE_API_URL;
import { useContext } from "react";
import { NetworkStatusContext } from "../contexts/NetworkStatusContext";
import { addPendingEdit } from "../utils/offlineQueue";
import { useApiFetch } from "./useApiFetch";

/**
 * Custom hook for managing save logic for sections and items.
 *
 * @param {Function} setShowModal - Show/hide the section modal.
 * @param {Function} setShowItemModal - Show/hide the item modal.
 * @param {Function} setTargetSectionId - Set the target section for editing.
 * @param {Function} setSections - Update the sections object.
 * @param {Function} setSectionOrder - Update the order of sections.
 * @param {Function} getAccessTokenSilently - Auth0 token fetcher for API calls.
 * @param {string} username - Current user's username.
 * @param {Object} currentUser - Current user object.
 * @param {Function} addLog - Function to add a log entry.
 * @param {Function} setPendingSectionTitle - Set pending section title.
 * @param {string} pendingSectionTitle - Current pending section title.
 * @param {Object} editingItem - Current item being edited.
 * @param {Function} setEditingItem - Set the editing item.
 * @param {string} targetSectionId - Current target section ID.
 * @param {Function} apiFetch - API fetch utility.
 * @returns {Object} Handlers for saving sections and items.
 * @example
 * const { handleSaveSection, handleSaveItem } = useSaveHandlers(...);
 */

const useSaveHandlers = (
  setShowModal,
  setShowItemModal,
  setTargetSectionId,
  setSections,
  setSectionOrder,
  getAccessTokenSilently,
  username,
  currentUser,
  addLog,
  setPendingSectionTitle,
  pendingSectionTitle,
  editingItem,
  setEditingItem,
  targetSectionId,
) => {
  const isOnline = useContext(NetworkStatusContext);
  const apiFetch = useApiFetch();

  const handleSaveSection = async () => {
    // if user is offline, save action to offline queue
    if (!isOnline) {
      // save to offline queue
      addPendingEdit({
        type: "section",
        action: "create",
        payload: {
          title: pendingSectionTitle,
          username: username,
        },
        timestamp: Date.now(),
      });
      setSections((prev) => ({
        ...prev,
        // temporary ID for offline section
        [`offline-${Date.now()}`]: {
          title: pendingSectionTitle,
          id: `offline-${Date.now()}`,
          items: [],
          offline: true,
        },
      }));
      setSectionOrder((prev) => [...prev, `offline-${Date.now()}`]);
      if (addLog) {
        addLog(`(Offline) You created section "${pendingSectionTitle}"`);
      }
      setShowModal(false);
      setPendingSectionTitle("");
      return;
    }

    const newSection = await apiFetch({
      endpoint: `${URL}/api/sections/${username}`,
      method: "POST",
      body: { title: pendingSectionTitle, username: currentUser?.nickname },
      getAccessTokenSilently,
    });

    const sectionId = newSection.id || newSection._id;

    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...newSection, id: sectionId, items: [] },
    }));
    setSectionOrder((prev) => [...prev, sectionId]);
    if (addLog) {
      addLog(`You created section "${newSection.title}"`);
    }
    setShowModal(false);
    setPendingSectionTitle("");
  };

  const handleSaveItem = async ({ content, link, notes }) => {
    if (!content.trim() || !targetSectionId) {
      setShowItemModal(false);
      setEditingItem(null);
      setTargetSectionId(null);
      return;
    }

    // if user is offline, save action to offline queue
    if (!isOnline) {
      // save to offline queue
      addPendingEdit({
        type: "item",
        action: editingItem ? "edit" : "create",
        payload: {
          content,
          link,
          notes,
          sectionId: targetSectionId,
          username: username,
          itemId: editingItem?.id,
        },
        timestamp: Date.now(),
      });

      if (editingItem) {
        // update existing item
        setSections((prev) => {
          const section = prev[targetSectionId];
          if (!section) return prev;
          return {
            ...prev,
            [targetSectionId]: {
              ...section,
              items: section.items.map(item => 
                item.id === editingItem.id 
                  ? { ...item, content, link, notes, offline: true }
                  : item
              ),
            },
          };
        });
        addLog(`(Offline) You edited item "${content}"`);
      } else {
        // create new item
        setSections((prev) => {
          const section = prev[targetSectionId];
          if (!section) return prev;
          return {
            ...prev,
            [targetSectionId]: {
              ...section,
              items: [
                ...section.items,
                {
                  id: `offline-item-${Date.now()}`,
                  content,
                  link,
                  notes,
                  offline: true,
                },
              ],
            },
          };
        });
        addLog(`(Offline) You added item "${content}"`);
      }
      
      setShowItemModal(false);
      setEditingItem(null);
      setTargetSectionId(null);
      return;
    }

    if (editingItem) {
      await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items/${editingItem.id}/${username}`,
        method: "PUT",
        body: {
          content,
          link,
          notes,
          sectionId: targetSectionId,
          username: currentUser?.nickname,
        },
        getAccessTokenSilently,
      });
      addLog(`You edited item "${editingItem.content}"`);
    } else {
      await apiFetch({
        endpoint: `${URL}/api/items/${targetSectionId}/items/${username}`,
        method: "POST",
        body: {
          content,
          link,
          notes,
          sectionId: targetSectionId,
          username: currentUser?.nickname,
        },
        getAccessTokenSilently,
      });
      addLog(`You added item "${content}"`);
    }

    setShowItemModal(false);
    setEditingItem(null);
    setTargetSectionId(null);
  };

  return {
    handleSaveSection,
    handleSaveItem,
  };
};

export default useSaveHandlers;