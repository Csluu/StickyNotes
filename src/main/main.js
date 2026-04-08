// main.js — Electron main process for StickyNotes (React + Vite conversion)
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const Store = require("electron-store");
const contextMenu = require("electron-context-menu");
const path = require("path");

const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";

// ── Window size constants ─────────────────────────────────────────────────────
const MAIN_WINDOW_WIDTH = 430;
const MAIN_WINDOW_HEIGHT = 625;
const NOTE_WINDOW_WIDTH = 500;
const NOTE_WINDOW_HEIGHT = 550;
const NOTE_WINDOW_MIN_WIDTH = 425;
const NOTE_WINDOW_MIN_HEIGHT = 350;

// ── electron-store setup ─────────────────────────────────────────────────────
// Stores:
//   windowPositions   — per noteId: { x, y, width, height }
//   mainWindowBounds  — { x, y, width, height }
//   currentNotes      — array of noteIds with open windows
//   alwaysOnTop       — per noteId: boolean
const store = new Store();

// ── Window state ──────────────────────────────────────────────────────────────
let mainWindow = null;
const openNotes = new Map(); // noteId → BrowserWindow

// ── Context menu (spell-checker) ─────────────────────────────────────────────
contextMenu({
  spellChecker: true,
  showSearchWithGoogle: false,
  showCopyImage: false,
  showSaveImageAs: false,
});

// ── Utility: throttle ──────────────────────────────────────────────────────────
const throttle = (func, limit) => {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ── Utility: get window bounds key ───────────────────────────────────────────
const getWindowBoundsKey = (noteId) => `windowPositions.${noteId}`;

// ── App resource path ────────────────────────────────────────────────────────
const getAppPath = (...segments) => {
  const base = app.isPackaged
    ? app.getAppPath()
    : path.join(__dirname, "..", "..");
  return path.join(base, ...segments);
};

// ── Load URL for a window ─────────────────────────────────────────────────────
const getLoadURL = (htmlPath, query = {}) => {
  if (!app.isPackaged) {
    const url = new URL("http://localhost:5173");
    url.pathname = htmlPath;
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.toString();
  }
  return `file://${path.join(
    getAppPath("dist", "renderer"),
    htmlPath
  )}?${new URLSearchParams(query).toString()}`;
};

// ── Create main window ─────────────────────────────────────────────────────────
const createMainWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }

  const { x, y, width, height } = store.get("mainWindowBounds", {});

  mainWindow = new BrowserWindow({
    x,
    y,
    width: width || (app.isPackaged ? MAIN_WINDOW_WIDTH : 1500),
    height: height || (app.isPackaged ? MAIN_WINDOW_HEIGHT : 675),
    transparent: true,
    resizable: false,
    frame: false,
    icon: isWin
      ? path.join(__dirname, "../build/icon.ico")
      : path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      spellcheck: true,
      devTools: !app.isPackaged,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/preload.js"),
    },
  });

  mainWindow.loadURL(getLoadURL("index.html"));

  // Save main window bounds on move/resize
  const saveMainBounds = throttle(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      store.set("mainWindowBounds", mainWindow.getBounds());
    }
  }, 500);

  mainWindow.on("move", saveMainBounds);
  mainWindow.on("resize", saveMainBounds);

  mainWindow.on("close", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      store.set("mainWindowBounds", mainWindow.getBounds());
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

// ── Create note window ─────────────────────────────────────────────────────────
const createNoteWindow = (noteId) => {
  if (openNotes.has(noteId)) {
    const win = openNotes.get(noteId);
    if (!win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
    return;
  }

  const boundsKey = getWindowBoundsKey(noteId);
  const savedBounds = store.get(boundsKey, {});
  const { x, y, width, height } = savedBounds;

  // Restore always-on-top state from store
  const isAlwaysOnTop = store.get(`alwaysOnTop.${noteId}`, false);

  const noteWindow = new BrowserWindow({
    x,
    y,
    width: width || (app.isPackaged ? NOTE_WINDOW_WIDTH : 1500),
    height: height || NOTE_WINDOW_HEIGHT,
    minWidth: NOTE_WINDOW_MIN_WIDTH,
    minHeight: NOTE_WINDOW_MIN_HEIGHT,
    transparent: true,
    resizable: true,
    frame: false,
    fullscreenable: false,
    maximizable: false,
    alwaysOnTop: isAlwaysOnTop,
    icon: isWin
      ? path.join(__dirname, "../build/icon.ico")
      : path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      spellcheck: true,
      devTools: !app.isPackaged,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/preload.js"),
    },
  });

  noteWindow.loadURL(getLoadURL("note.html", { id: noteId }));

  // Send note data once loaded
  noteWindow.webContents.on("did-finish-load", () => {
    if (!noteWindow.isDestroyed()) {
      noteWindow.webContents.send("note-data", noteId);

      // Fix: if savedBounds was empty (first launch), capture the initial
      // Electron-assigned position and persist it so reopening remembers it
      const hadNoSavedBounds = !x && !y && !width && !height;
      if (hadNoSavedBounds) {
        store.set(boundsKey, noteWindow.getBounds());
      }
    }
  });

  // Track open notes
  openNotes.set(noteId, noteWindow);

  // Persist currentNotes in store
  const currentNotes = store.get("currentNotes", []);
  if (!currentNotes.includes(noteId)) {
    currentNotes.push(noteId);
    store.set("currentNotes", currentNotes);
  }

  // Save window bounds on move/resize (throttled)
  const saveNoteBounds = throttle(() => {
    if (noteWindow && !noteWindow.isDestroyed()) {
      store.set(boundsKey, noteWindow.getBounds());
    }
  }, 500);

  noteWindow.on("move", saveNoteBounds);
  noteWindow.on("resize", saveNoteBounds);
  noteWindow.on("close", () => {
    if (noteWindow && !noteWindow.isDestroyed()) {
      store.set(boundsKey, noteWindow.getBounds());
    }
  });

  noteWindow.on("closed", () => {
    openNotes.delete(noteId);
  });
};

// ── Close note window ──────────────────────────────────────────────────────────
const closeNoteWindow = (noteId) => {
  const win = openNotes.get(noteId);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  openNotes.delete(noteId);
};

// ── IPC Handlers ───────────────────────────────────────────────────────────────

// renderer → main: create-new-window
ipcMain.on("create-new-window", (event, noteId) => {
  if (typeof noteId === "string" && noteId.length > 0) {
    createNoteWindow(noteId);
  }
});

// renderer → main: close-window
ipcMain.on("close-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

// renderer → main: minimize-window
ipcMain.on("show-main-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
});

ipcMain.on("minimize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

// renderer → main: resize-window (note window only)
ipcMain.on("resize-window", (event, width, height) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.setMinimumSize(NOTE_WINDOW_MIN_WIDTH, NOTE_WINDOW_MIN_HEIGHT);
    win.setSize(typeof width === "number" ? width : NOTE_WINDOW_WIDTH, typeof height === "number" ? height : NOTE_WINDOW_HEIGHT, true);
  }
});

// renderer → main: toggle-always-on-top
ipcMain.on("toggle-always-on-top", (event, noteId) => {
  let targetWin = null;
  if (noteId) {
    targetWin = openNotes.get(noteId);
  }
  if (!targetWin) {
    targetWin = BrowserWindow.getFocusedWindow();
  }
  if (targetWin && !targetWin.isDestroyed()) {
    const newValue = !targetWin.isAlwaysOnTop();
    targetWin.setAlwaysOnTop(newValue);
    // Persist to electron-store
    if (noteId) {
      store.set(`alwaysOnTop.${noteId}`, newValue);
    }
  }
});

// renderer → main: update-note (note modified — no-op on main, notes in renderer localStorage)
ipcMain.on("update-note", (event, noteId) => {
  // Note content is saved to localStorage in renderer.
  // Main process tracks window session state only.
});

// renderer → main: quit-note — remove from session store
ipcMain.on("quit-note", (event, noteId) => {
  const currentNotes = store.get("currentNotes", []);
  const newNotes = currentNotes.filter((id) => id !== noteId);
  store.set("currentNotes", newNotes);
  closeNoteWindow(noteId);
});

// renderer → main: note-modified — refresh main window notes list
ipcMain.on("note-modified", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-notes-list");
  }
});

// renderer → main (invoke): show-confirmation-dialog
ipcMain.handle("show-confirmation-dialog", async (event, options) => {
  const result = await dialog.showMessageBox({
    type: options.type || "question",
    buttons: options.buttons || ["Yes", "No"],
    defaultId: options.defaultId || 0,
    title: options.title || "Sticky Notes",
    message: options.message || "Are you sure?",
    detail: options.detail || "",
    cancelId: options.cancelId || 1,
    noLink: true,
  });
  return result.response; // button index
});

// ── Single Instance Lock ──────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createMainWindow();

    // Session restore: open previously open notes
    const currentNotes = store.get("currentNotes", []);
    if (Array.isArray(currentNotes)) {
      currentNotes.forEach((noteId) => {
        if (typeof noteId === "string" && noteId.length > 0) {
          createNoteWindow(noteId);
        }
      });
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });
}

// Prevent app quit when all windows are closed (macOS-style behaviour for all platforms)
app.on("window-all-closed", (event) => {
  event.preventDefault();
});

app.on("before-quit", () => {
  app.isQuitting = true;
});
