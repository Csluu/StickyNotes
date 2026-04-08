const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	mainWindow: () => ipcRenderer.send("main-window"),
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
	newWindow: (note) => ipcRenderer.send("create-new-window", note || undefined),
	updateNote: (note) => ipcRenderer.send("update-note", note),
	quitNote: (noteID) => ipcRenderer.send("quit-note", noteID),
	// Send a message to the main process (e.g., when a note is modified)
	sendNoteModified: () => ipcRenderer.send("note-modified"),
	// Register a callback to be invoked when the notes list needs to be updated
	onNotesListUpdate: (callback) => {
		ipcRenderer.on("update-notes-list", (event, ...args) => callback(...args));
	},
	on: (channel, func) =>
		ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("electronAPI", {
	resizeWindow: (width, height) => {
		ipcRenderer.send("resize-window", width, height);
	},
	toggleAlwaysOnTop: (noteId) => {
		ipcRenderer.send("toggle-always-on-top", noteId);
	},
	showConfirmationDialog: (options) =>
		ipcRenderer.invoke("show-confirmation-dialog", options),
});

ipcRenderer.on("note-data", (event, note) => {
	console.log("note-data event received", note);
});
