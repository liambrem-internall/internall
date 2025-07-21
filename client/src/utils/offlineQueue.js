export function addPendingEdit(edit) {
  const queue = JSON.parse(localStorage.getItem("pendingEdits") || "[]");
  queue.push(edit);
  localStorage.setItem("pendingEdits", JSON.stringify(queue));
}

export function getPendingEdits() {
  return JSON.parse(localStorage.getItem("pendingEdits") || "[]");
}

export function clearPendingEdits() {
  localStorage.removeItem("pendingEdits");
}