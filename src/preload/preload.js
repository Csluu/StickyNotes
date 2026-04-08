// preload.js — Electron preload script for StickyNotes
// Exposes a secure IPC bridge to renderer process via contextBridge
// Used by BOTH main window and note windows (same preload, different usage patterns)

const { contextBridge, ipcRenderer } = require("electron");

// ── API exposed to window.electronAPI ──────────────────────────────────────────
contextBridge.exposeInMainWorld("electronAPI", {
  // ── Window management ──────────────────────────────────────────────────────
  // Create a new note window (main window → main process)
  createNewWindow: (noteId) => ipcRenderer.send("create-new-window", noteId),

  // Close the focused window (both windows)
  closeWindow: () => ipcRenderer.send("close-window"),

  // Minimize the focused window (both windows)
  minimizeWindow: () => ipcRenderer.send("minimize-window"),

  // Resize note window (note window only)
  // Note: main.js expects (width, height) as positional args, not object
  resizeWindow: (width, height) => ipcRenderer.send("resize-window", width, height),

  // Toggle always-on-top for a note (note window)
  toggleAlwaysOnTop: (noteId) => ipcRenderer.send("toggle-always-on-top", noteId),

  // Show/focus the main window (note window → main process)
  showMainWindow: () => ipcRenderer.send("show-main-window"),

  // ── Note sync ──────────────────────────────────────────────────────────────
  // Notify main process that a note was modified
  updateNote: (noteId) => ipcRenderer.send("update-note", noteId),

  // Fire note-modified IPC — tells main window to refresh its notes list
  noteModified: () => ipcRenderer.send("note-modified"),

  // Remove note from session store and close window
  quitNote: (noteId) => ipcRenderer.send("quit-note", noteId),

  // ── Main window communication (for note windows) ───────────────────────────
  // Send note ID to main (note window → main)
  // Note: main.js listens for "note-data" from renderer and responds with note-data event
  // This is handled automatically by main.js on did-finish-load, but exposing for completeness
  sendNoteData: (noteId) => ipcRenderer.send("note-data", noteId),

  // ── Event listeners (renderer subscribes to main → renderer events) ────────
  // Listen for note data from main process (note windows receive their noteId)
  onNoteData: (callback) => ipcRenderer.on("note-data", callback),

  // Listen for notes list update (main window refreshes list)
  onUpdateNotesList: (callback) => ipcRenderer.on("update-notes-list", callback),

  // Listen for note modified events (main window listens to refresh)
  onNoteModified: (callback) => ipcRenderer.on("note-modified", callback),

  // ── Dialog ─────────────────────────────────────────────────────────────────
  // Show confirmation dialog (async, returns button index)
  showConfirmationDialog: (options) =>
    ipcRenderer.invoke("show-confirmation-dialog", options),

  // ── Utility ────────────────────────────────────────────────────────────────
  // Remove all listeners for a channel (cleanup helper)
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// Log preload load for debugging
console.log("[preload] electronAPI exposed — channels ready");
