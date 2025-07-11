const URL = import.meta.env.VITE_API_URL;

const useSaveHandlers = ({
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
  apiFetch,
}) => {
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
