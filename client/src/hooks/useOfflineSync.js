import { useEffect, useContext, useCallback, useRef } from "react";
import { NetworkStatusContext } from "../contexts/NetworkStatusContext";
import { getPendingEdits, clearPendingEdits } from "../utils/offlineQueue";
import { apiFetch } from "../utils/apiFetch";

const URL = import.meta.env.VITE_API_URL;

export default function useOfflineSync(getAccessTokenSilently, username) {
  const isOnline = useContext(NetworkStatusContext);
  const isSyncing = useRef(false);

  const syncPendingEdits = useCallback(async () => {
    if (isSyncing.current) {
      return false;
    }

    const edits = getPendingEdits();
    if (edits.length === 0) {
      return false;
    }

    isSyncing.current = true;

    try {
      // process edits sequentially from queue
      for (const edit of edits) {
        
        const editUsername = edit.payload.username || username;

        if (!editUsername) {
          console.error("No username available for edit:", edit);
          continue; // skip this edit if no username is available
        }

        // SECTION ACTIONS
        if (edit.type === "section") {
          if (edit.action === "create") {
            await apiFetch({
              endpoint: `${URL}/api/sections/${editUsername}`,
              method: "POST",
              body: {
                title: edit.payload.title,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "edit") {
            await apiFetch({
              endpoint: `${URL}/api/sections/${edit.payload.sectionId}`,
              method: "PUT",
              body: {
                title: edit.payload.title,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "delete") {
            await apiFetch({
              endpoint: `${URL}/api/sections/${edit.payload.sectionId}/${editUsername}`,
              method: "DELETE",
              body: { username: editUsername },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "reorder") {
            await apiFetch({
              endpoint: `${URL}/api/sections/user/${editUsername}/order`,
              method: "PUT",
              body: {
                order: edit.payload.order,
                movedId: edit.payload.movedId,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
        }

        // ITEM ACTIONS
        if (edit.type === "item") {
          if (edit.action === "create") {
            await apiFetch({
              endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${editUsername}`,
              method: "POST",
              body: {
                content: edit.payload.content,
                link: edit.payload.link,
                notes: edit.payload.notes,
                sectionId: edit.payload.sectionId,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "edit") {
            await apiFetch({
              endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}`,
              method: "PUT",
              body: {
                content: edit.payload.content,
                link: edit.payload.link,
                notes: edit.payload.notes,
                sectionId: edit.payload.sectionId,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "delete") {
            await apiFetch({
              endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}`,
              method: "DELETE",
              body: { username: editUsername },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "reorder") {
            await apiFetch({
              endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${editUsername}/order`,
              method: "PUT",
              body: {
                order: edit.payload.order,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "move") {
            await apiFetch({
              endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}/move`,
              method: "PUT",
              body: {
                toSectionId: edit.payload.toSectionId,
                toIndex: edit.payload.toIndex,
                username: editUsername,
              },
              getAccessTokenSilently,
              isOnline,
            });
          }
        }

        const timeout = 100;
        // small delay between requests
        await new Promise(resolve => setTimeout(resolve, timeout));
      }

      clearPendingEdits();
      isSyncing.current = false;
      return true;
    } catch (error) {
      console.error("Failed to sync pending edits:", error);
      isSyncing.current = false;
      return false;
    }
  }, [getAccessTokenSilently, isOnline, username]);

  useEffect(() => {
    if (!isOnline) return;

    const timeout = 1000;
    
    //sync when coming online with a small delay
    const timeoutId = setTimeout(() => {
      syncPendingEdits();
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isOnline, syncPendingEdits]);

  return { syncPendingEdits };
}
