const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	mainWindow: () => ipcRenderer.send("main-window"),
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
	newWindow: (note) => ipcRenderer.send("create-new-window", note || undefined),
	updateNote: (note) => ipcRenderer.send("update-note", note),
	on: (channel, func) =>
		ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("electronAPI", {
	resizeWindow: (width, height) => {
		ipcRenderer.send("resize-window", width, height);
	},
});

ipcRenderer.on("note-data", (event, note) => {
	console.log("note-data event received", note);
	document.getElementById("noteTitle").value = note.title;
	document.getElementById("noteText").value = note.text;
});
