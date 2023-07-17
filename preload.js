const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	closeWindow: () => ipcRenderer.send("close-window"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
	newWindow: () => ipcRenderer.send("create-new-window"),
});

contextBridge.exposeInMainWorld("electronAPI", {
	resizeWindow: (width, height) => {
		ipcRenderer.send("resize-window", width, height);
	},
});
