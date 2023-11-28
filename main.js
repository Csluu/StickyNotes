// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const contextMenu = require("electron-context-menu");

const currentWindow = require("electron").BrowserWindow.getFocusedWindow();
const path = require("path");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

const store = new Store();

let mainWindow;
const openNotes = new Map();

contextMenu({
	spellChecker: true,
	showSearchWithGoogle: false,
	showCopyImage: false,
	showSaveImageAs: false,
});

const createMainWindow = () => {
	// If mainWindow exists, just focus it
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}
		mainWindow.focus();
		return;
	}
	let { x, y } = store.get("windowPosition", { x: undefined, y: undefined });

	// Create the browser window.
	mainWindow = new BrowserWindow({
		x,
		y,
		width: isDev ? 1500 : 430,
		height: 675,
		transparent: true,
		resizable: false,
		frame: false,
		icon: isWin
			? path.join(__dirname, "./Renderer/assets/icons/icon.ico")
			: path.join(__dirname, "./Renderer/assets/icons/icon.png"),
		webPreferences: {
			// Set this to false when in production
			spellcheck: true,
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

	// Reset the mainWindow variable to null when it's closed
	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Get the button element
};

// * App Initialization
// Request single instance lock
// Making sure if there is another instance of this application or not.

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	// If there is another instance running quit this new instance
	console.log("Application is already running");
	app.quit();
} else {
	app.on("second-instance", (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

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
}

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

ipcMain.on("main-window", () => {
	createMainWindow();

	// Remove mainWindow from memory on close to prevent memory leak
	mainWindow.on("closed", () => (mainWindow = null));
});

// Create a function that generates a unique key for storing window position and size
const getWindowBoundsKey = (id) => `windowBounds-${id}`;

//
ipcMain.on("create-new-window", (event, note) => {
	console.log("Received 'create-new-window' event with note:", note);

	const noteWindow = openNotes.get(note.id);

	if (noteWindow) {
		if (noteWindow.isMinimized()) {
			noteWindow.restore();
		}
		noteWindow.focus();
	} else {
		const boundsKey = getWindowBoundsKey(note.id);
		const { width, height, x, y } = store.get(boundsKey, {});

		const newNoteWindow = new BrowserWindow({
			x,
			y,
			width: width || (isDev ? 1500 : 425),
			height: height || 350,
			transparent: true,
			resizable: false, // modified to allow resizing
			frame: false,
			fullscreenable: false,
			maximizable: false,
			webPreferences: {
				// Set this to true for debugging
				spellcheck: true,
				devTools: isDev ? true : false,
				contextIsolation: true,
				enableRemoteModule: false,
				nodeIntegration: false,
				preload: path.join(__dirname, "preload.js"),
			},
		});

		// Load, send data, etc...
		newNoteWindow.loadFile(path.join(__dirname, "./Renderer/html/note.html"));
		newNoteWindow.webContents.on("did-finish-load", () => {
			newNoteWindow.webContents.send("note-data", note);
		});

		if (isDev) {
			newNoteWindow.webContents.openDevTools();
		}

		// Add the new window to our map
		openNotes.set(note.id, newNoteWindow);

		// Save window bounds when closed
		// "close" is right before its going to close out
		newNoteWindow.on("close", () => {
			const { x, y, width, height } = newNoteWindow.getBounds();
			store.set(boundsKey, { x, y, width, height });
		});

		// Remove the window from our map when it's closed
		// "closed" is when the window is actually closed out
		newNoteWindow.on("closed", () => {
			openNotes.delete(note.id);
		});
	}
});

ipcMain.on("resize-window", (event, width, height) => {
	const window = BrowserWindow.getFocusedWindow();
	if (window) {
		window.setMinimumSize(425, 350);
		window.setSize(width, height);
	}
});

ipcMain.on("toggle-always-on-top", (event, noteId) => {
	let targetWindow;

	// If a noteId is provided, try to find that specific window
	if (noteId) {
		targetWindow = openNotes.get(noteId);
	} else {
		// Otherwise, use the focused window
		targetWindow = BrowserWindow.getFocusedWindow();
	}

	if (targetWindow) {
		const currentState = targetWindow.isAlwaysOnTop();
		targetWindow.setAlwaysOnTop(!currentState);
	}
});
