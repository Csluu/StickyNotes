// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");

const currentWindow = require("electron").BrowserWindow.getFocusedWindow();
const path = require("path");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

const store = new Store();

let mainWindow;

const createMainWindow = () => {
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x,
		y,
		width: isDev ? 1500 : 425,
		height: 675,
		transparent: true,
		resizable: false,
		frame: false,
		icon: isWin
			? path.join(__dirname, "./Renderer/assets/icons/icon.ico")
			: path.join(__dirname, "./Renderer/assets/icons/icon.png"),
		webPreferences: {
			// Set this to false when in production
			devTools: isDev ? true : false,
			nodeIntegration: true,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "./Renderer/html/index.html"));

	// Save window position when the window is closed.
	mainWindow.on("close", () => {
		let { x, y } = mainWindow.getBounds();
		store.set("windowPosition", { x, y });
	});

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Get the button element
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createMainWindow();

	// Remove mainWindow from memory on close to prevent memory leak
	mainWindow.on("closed", () => (mainWindow = null));

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (!isMac) {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("close-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.close();
	}
});

ipcMain.on("minimize-window", () => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.minimize();
	}
});

// 675
ipcMain.on("create-new-window", (event, note) => {
	console.log("Received 'create-new-window' event with note:", note);
	const newWindow = new BrowserWindow({
		width: isDev ? 1500 : 425,
		height: 300,
		transparent: true,
		resizable: false, // modified to allow resizing
		frame: false,
		fullscreenable: false,
		maximizable: false,
		webPreferences: {
			// Set this to true for debugging
			devTools: isDev ? true : false,
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	newWindow.loadFile(path.join(__dirname, "./Renderer/html/note.html"));

	// Send note data and id to new window
	newWindow.webContents.on("did-finish-load", () => {
		console.log("new window did finish load, sending note data", note); // Add this line
		newWindow.webContents.send("note-data", note);
	});

	// Open the DevTools for newWindow
	newWindow.webContents.openDevTools();
});

ipcMain.on("resize-window", (event, width, height) => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.setMinimumSize(425, 250);
		window.setSize(width, height);
	}
});
