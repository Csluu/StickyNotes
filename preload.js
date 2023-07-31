const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
	newWindow: (note, noteId) =>
		ipcRenderer.send("create-new-window", note, noteId),
	updateNote: (note, noteId) => ipcRenderer.send("update-note", note, noteId),
	on: (channel, func) =>
		ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("electronAPI", {
	resizeWindow: (width, height) => {
		ipcRenderer.send("resize-window", width, height);
	},
});

ipcRenderer.on("note-data", (event, note, noteId) => {
	console.log("note-data event received", note);
	note.id = noteId; // Store noteId in the note object
	document.getElementById("noteTitle").value = note.title;
	document.getElementById("noteText").value = note.text;
});
