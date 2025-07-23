import { useEffect, useContext, useCallback, useRef } from "react";
import { NetworkStatusContext } from "../contexts/NetworkStatusContext";
import { getPendingEdits, clearPendingEdits } from "../utils/offlineQueue";
import { apiFetch } from "../utils/apiFetch";

const URL = import.meta.env.VITE_API_URL;

const EDIT_TYPES = Object.freeze({
  SECTION: "section",
  ITEM: "item",
});

const EDIT_ACTIONS = Object.freeze({
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  REORDER: "reorder",
  MOVE: "move",
});

export default function useOfflineSync(
  getAccessTokenSilently,
  username,
  addLog
) {
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
    let syncedCount = 0;
    let conflictCount = 0;

    try {
      // process edits sequentially from queue
      for (const edit of edits) {
        const editUsername = edit.payload.username || username;

        if (!editUsername) {
          console.error("No username available for edit:", edit);
          continue;
        }

        try {
          // SECTION ACTIONS
          if (edit.type === EDIT_TYPES.SECTION) {
            if (edit.action === EDIT_ACTIONS.CREATE) {
              await apiFetch({
                endpoint: `${URL}/api/sections/${editUsername}`,
                method: "POST",
                body: {
                  title: edit.payload.title,
                  username: editUsername,
                  timestamp: edit.timestamp,
                },
                getAccessTokenSilently,
                isOnline,
              });
              if (addLog)
                addLog(`Synced: Created section "${edit.payload.title}"`);
            }
            if (edit.action === EDIT_ACTIONS.EDIT) {
              await apiFetch({
                endpoint: `${URL}/api/sections/${edit.payload.sectionId}`,
                method: "PUT",
                body: {
                  title: edit.payload.title,
                  username: editUsername,
                  timestamp: edit.timestamp,
                },
                getAccessTokenSilently,
                isOnline,
              });
              if (addLog)
                addLog(`Synced: Updated section "${edit.payload.title}"`);
            }
            if (edit.action === EDIT_ACTIONS.DELETE) {
              await apiFetch({
                endpoint: `${URL}/api/sections/${edit.payload.sectionId}/${editUsername}`,
                method: "DELETE",
                body: {
                  username: editUsername,
                  timestamp: edit.timestamp,
                },
                getAccessTokenSilently,
                isOnline,
              });
              if (addLog) addLog(`Synced: Deleted section`);
            }
            if (edit.action === EDIT_ACTIONS.REORDER) {
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
              if (addLog) addLog(`Synced: Reordered sections`);
            }
          }

          // ITEM ACTIONS
          if (edit.type === EDIT_TYPES.ITEM) {
            if (edit.action === EDIT_ACTIONS.CREATE) {
              await apiFetch({
                endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${editUsername}`,
                method: "POST",
                body: {
                  content: edit.payload.content,
                  link: edit.payload.link,
                  notes: edit.payload.notes,
                  sectionId: edit.payload.sectionId,
                  username: editUsername,
                  timestamp: edit.timestamp,
                },
                getAccessTokenSilently,
                isOnline,
              });
              if (addLog)
                addLog(`Synced: Created item "${edit.payload.content}"`);
            }
            if (edit.action === EDIT_ACTIONS.EDIT) {
              // frst, try to find the item to get its current location
              try {
                const currentItem = await apiFetch({
                  endpoint: `${URL}/api/items/find/${edit.payload.itemId}`,
                  method: "GET",
                  getAccessTokenSilently,
                  isOnline,
                });
                
                const currentSectionId = currentItem.currentSectionId || currentItem.sectionId;
                
                await apiFetch({
                  endpoint: `${URL}/api/items/${currentSectionId}/items/${edit.payload.itemId}/${editUsername}`,
                  method: "PUT",
                  body: {
                    content: edit.payload.content,
                    link: edit.payload.link,
                    notes: edit.payload.notes,
                    sectionId: edit.payload.sectionId,
                    username: editUsername,
                    timestamp: edit.timestamp,
                    isOfflineEdit: true,
                  },
                  getAccessTokenSilently,
                  isOnline,
                });
              } catch (findError) {
                if (findError.status === 404) {
                  // item was deleted, skip this edit
                  if (addLog) {
                    addLog(`Skipped edit: Item was deleted`);
                  }
                  continue;
                } else if (findError.status === 409) {
                  // edit conflict
                  if (addLog) {
                    addLog(`Conflict: Item was modified by another user more recently`);
                  }
                  continue;
                } else {
                  // try with the original section ID as fallback
                  try {
                    await apiFetch({
                      endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}`,
                      method: "PUT",
                      body: {
                        content: edit.payload.content,
                        link: edit.payload.link,
                        notes: edit.payload.notes,
                        sectionId: edit.payload.sectionId,
                        username: editUsername,
                        timestamp: edit.timestamp,
                      },
                      getAccessTokenSilently,
                      isOnline,
                    });
                  } catch (fallbackError) {
                    if (fallbackError.status === 404) {
                      if (addLog) {
                        addLog(`Skipped edit: Item was deleted`);
                      }
                      continue;
                    } else if (fallbackError.status === 409) {
                      if (addLog) {
                        addLog(`Conflict: Item was modified by another user more recently`);
                      }
                      continue;
                    } else {
                      throw fallbackError;
                    }
                  }
                }
              }
              
              if (addLog)
                addLog(`Synced: Updated item "${edit.payload.content}"`);
            }
            if (edit.action === EDIT_ACTIONS.DELETE) {
              // try to delete from the original section first, then try to find and delete
              let deleteSuccessful = false;
              
              try {
                // try deleting from original section first
                await apiFetch({
                  endpoint: `${URL}/api/items/${edit.payload.sectionId}/items/${edit.payload.itemId}/${editUsername}`,
                  method: "DELETE",
                  body: {
                    username: editUsername,
                    timestamp: edit.timestamp,
                  },
                  getAccessTokenSilently,
                  isOnline,
                });
                deleteSuccessful = true;
              } catch (originalError) {
                if (originalError.status === 404) {
                  // item not in original section, try to find current location
                  try {
                    const currentItem = await apiFetch({
                      endpoint: `${URL}/api/items/find/${edit.payload.itemId}`,
                      method: "GET",
                      getAccessTokenSilently,
                      isOnline,
                    });
                    
                    const currentSectionId = currentItem.sectionId;
                    
                    await apiFetch({
                      endpoint: `${URL}/api/items/${currentSectionId}/items/${edit.payload.itemId}/${editUsername}`,
                      method: "DELETE",
                      body: {
                        username: editUsername,
                        timestamp: edit.timestamp,
                      },
                      getAccessTokenSilently,
                      isOnline,
                    });
                    deleteSuccessful = true;
                  } catch (findError) {
                    if (findError.status === 404) {
                      // item was already deleted by someone else
                      if (addLog) {
                        addLog(`Skipped delete: Item was already deleted`);
                      }
                      deleteSuccessful = true; 
                    } else if (findError.status === 409) {
                      // delete conflict - item was modified more recently
                      if (addLog) {
                        addLog(`Conflict: Item was modified by another user more recently, delete skipped`);
                      }
                      deleteSuccessful = true; 
                    } else {
                      throw findError;
                    }
                  }
                } else if (originalError.status === 409) {
                  // delete conflict on original section
                  if (addLog) {
                    addLog(`Conflict: Item was modified by another user more recently, delete skipped`);
                  }
                  deleteSuccessful = true; 
                } else {
                  throw originalError;
                }
              }
              
              if (deleteSuccessful && addLog) {
                addLog(`Synced: Deleted item`);
              }
            }
            if (edit.action === EDIT_ACTIONS.REORDER) {
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
              if (addLog) addLog(`Synced: Reordered items`);
            }
            if (edit.action === EDIT_ACTIONS.MOVE) {
              try {
                // first check if item still exists and get current location
                const currentItem = await apiFetch({
                  endpoint: `${URL}/api/items/find/${edit.payload.itemId}`,
                  method: "GET",
                  getAccessTokenSilently,
                  isOnline,
                });
                
                const currentSectionId = currentItem.currentSectionId || currentItem.sectionId;
                
                await apiFetch({
                  endpoint: `${URL}/api/items/${currentSectionId}/items/${edit.payload.itemId}/${editUsername}/move`,
                  method: "PUT",
                  body: {
                    toSectionId: edit.payload.toSectionId,
                    toIndex: edit.payload.toIndex,
                    username: editUsername,
                    timestamp: edit.timestamp,
                  },
                  getAccessTokenSilently,
                  isOnline,
                });
                if (addLog) addLog(`Synced: Moved item`);
              } catch (error) {
                if (error.status === 409) {
                  // move conflict - item was moved more recently
                  if (addLog) {
                    addLog(`Conflict: Item was moved by another user more recently`);
                  }
                  continue;
                } else if (error.status === 404) {
                  // item was deleted
                  if (addLog) {
                    addLog(`Skipped move: Item was deleted`);
                  }
                  continue;
                } else {
                  throw error;
                }
              }
            }
          }

          syncedCount++;
        } catch (error) {
          if (error.status === 409) {
            conflictCount++;
            if (addLog) {
              addLog(
                `Conflict resolved: ${edit.type} was modified by another user more recently`
              );
            }
            continue;
          } else {
            throw error;
          }
        }

        const timeout = 100;
        await new Promise((resolve) => setTimeout(resolve, timeout));
      }

      clearPendingEdits();
      isSyncing.current = false;

      if (addLog) {
        if (syncedCount > 0) {
          addLog(`Successfully synced ${syncedCount} offline changes`);
        }
        if (conflictCount > 0) {
          addLog(`${conflictCount} changes were skipped due to conflicts`);
        }
      }

      return {
        success: true,
        syncedCount,
        conflictCount,
        needsRefetch: syncedCount > 0 || conflictCount > 0,
      };
    } catch (error) {
      console.error("Failed to sync pending edits:", error);
      isSyncing.current = false;
      if (addLog) addLog(`Failed to sync offline changes: ${error.message}`);
      return { success: false, error };
    }
  }, [getAccessTokenSilently, isOnline, username, addLog]);

  useEffect(() => {
    if (!isOnline) return;

    const timeout = 1000;

    const timeoutId = setTimeout(() => {
      syncPendingEdits();
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isOnline, syncPendingEdits]);

  return { syncPendingEdits };
}
