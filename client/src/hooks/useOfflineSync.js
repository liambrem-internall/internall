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
      console.log("Already syncing, skipping...");
      return false;
    }

    const edits = getPendingEdits();
    if (edits.length === 0) {
      console.log("No pending edits to sync");
      return false;
    }

    isSyncing.current = true;
    console.log("Syncing pending edits:", edits);

    try {
      // Process edits sequentially to maintain order
      for (const edit of edits) {
        console.log("Processing edit:", edit);
        
        // Use username from payload if available, otherwise fall back to passed username
        const editUsername = edit.payload.username || username;
        console.log("Using username:", editUsername);

        if (!editUsername) {
          console.error("No username available for edit:", edit);
          continue; // Skip this edit if no username is available
        }

        // SECTION ACTIONS
        if (edit.type === "section") {
          if (edit.action === "create") {
            console.log("Syncing section create:", edit.payload.title);
            await apiFetch({
              endpoint: `/api/sections/${editUsername}`,
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
            console.log("Syncing section edit:", edit.payload.title);
            await apiFetch({
              endpoint: `/api/sections/${edit.payload.sectionId}`,
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
            console.log("Syncing section delete:", edit.payload.sectionId);
            await apiFetch({
              endpoint: `/api/sections/${edit.payload.sectionId}/${editUsername}`,
              method: "DELETE",
              body: { username: editUsername },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "reorder") {
            console.log("Syncing section reorder");
            await apiFetch({
              endpoint: `/api/sections/user/${editUsername}/order`,
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
            console.log("Syncing item create:", edit.payload.content);
            await apiFetch({
              endpoint: `/api/items/${edit.payload.sectionId}/items/${editUsername}`,
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
            console.log("Syncing item edit:", edit.payload.content);
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
            console.log("Syncing item delete:", edit.payload.itemId);
            await apiFetch({
              endpoint: `/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}`,
              method: "DELETE",
              body: { username: editUsername },
              getAccessTokenSilently,
              isOnline,
            });
          }
          if (edit.action === "reorder") {
            console.log("Syncing item reorder");
            await apiFetch({
              endpoint: `/api/items/${edit.payload.sectionId}/items/${editUsername}/order`,
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
            console.log("Syncing item move");
            await apiFetch({
              endpoint: `/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}/move`,
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

        // Small delay between operations to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      clearPendingEdits();
      console.log("Successfully synced all pending edits");
      isSyncing.current = false;
      return true;
    } catch (error) {
      console.error("Failed to sync pending edits:", error);
      isSyncing.current = false;
      // Don't clear edits if sync failed - they'll be retried next time
      return false;
    }
  }, [getAccessTokenSilently, isOnline, username]);

  useEffect(() => {
    if (!isOnline) return;
    
    // Sync when coming online with a small delay to ensure connection is stable
    const timeoutId = setTimeout(() => {
      console.log("Coming online, attempting to sync...");
      syncPendingEdits();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isOnline, syncPendingEdits]);

  return { syncPendingEdits };
}
