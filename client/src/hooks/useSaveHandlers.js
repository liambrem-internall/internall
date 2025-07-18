const URL = import.meta.env.VITE_API_URL;

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
  apiFetch
) => {
  const handleSaveSection = async () => {
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
      if (editingItem) {
        addLog(`You edited item "${editingItem.content}"`);
      } else {
        addLog(`${currentUser?.nickname || "Someone"} added item "${content}"`);
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
