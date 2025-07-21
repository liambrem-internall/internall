const PENDING_EDITS = "pendingEdits";

export function addPendingEdit(edit) {
  const queue = JSON.parse(localStorage.getItem(PENDING_EDITS) || "[]");
  queue.push(edit);
  localStorage.setItem(PENDING_EDITS, JSON.stringify(queue));
}

export function getPendingEdits() {
  return JSON.parse(localStorage.getItem(PENDING_EDITS) || "[]");
}

export function clearPendingEdits() {
  localStorage.removeItem(PENDING_EDITS);
}