# StickyNotes UX Polish — Architecture

## 1. Empty State UI

### Where shown
`NotesList.jsx` — when `filtered.length === 0` and no `searchQuery`.

### Component structure
```
EmptyState (new component)
├── SVG illustration (sticky note icon, inline)
├── <h2> "No notes yet" heading
├── <p> subtext ("Create your first note to get started")
└── <button> "Create Note" CTA
    └── onClick → createNote() + createNewWindow(id)
```

### Appearance
- Centered in the note list area, vertically padded.
- Large sticky-note SVG icon (64x64), muted gray.
- Heading: `text-xl font-semibold text-gray-400`.
- Subtext: `text-sm text-gray-500 mt-1`.
- CTA button: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-medium`.

### Behavior
- Only shown when `notes.length === 0` (not when search returns empty).
- On click: calls `createNote()` from `useNotes()`, then `window.electronAPI.createNewWindow(id)`.

### File to create
`src/renderer/components/main/EmptyState.jsx`

---

## 2. Real-Time Sync (IPC Push, No Focus Polling)

### Current state
`main.js` already has the IPC channel wired:
- `note-modified` (renderer → main): fires from note window on any save
- `update-notes-list` (main → renderer): sent to main window's webContents

### Gap
The renderer handler in `MainWindow.jsx` is a no-op:
```js
const handler = () => {
  // Notes context re-reads from storage automatically on render
  // Just force a re-render by using the hook
};
```
It needs to force a context refresh.

### Fix — `MainWindowInner` in `MainWindow.jsx`
```js
const [, forceUpdate] = useState(0);
useEffect(() => {
  const handler = () => forceUpdate(n => n + 1);
  window.electronAPI.onUpdateNotesList(handler);
  return () => {};
}, []);
```
The `NotesContext` reads from `localStorage` on every render, so incrementing a state counter triggers a re-render with fresh data. No polling, no focus events.

### Preload exposure (confirm in `preload.js`)
```js
onUpdateNotesList: (callback) => ipcRenderer.on('update-notes-list', callback)
```

### IPC flow
```
NoteWindow saves note
  → window.electronAPI.updateNote(noteId)
    → ipcMain.on('update-note') [no-op in main]
    → ipcMain.on('note-modified')
      → mainWindow.webContents.send('update-notes-list')
        → MainWindow.onUpdateNotesList handler
          → forceUpdate → NotesContext re-reads localStorage
```

---

## 3. Note Card Line Clamping

### CSS approach
Use Tailwind's built-in `line-clamp` plugin (included by default in Tailwind v3+).

### Changes in `NoteCard.jsx`

**Title:**
```jsx
<h2 className="w-fit flex flex-row gap-2 place-items-center">
  <span className={`${note.color || "bg-green-500"} w-3 h-3 rounded-full`} />
  <p className="overflow-scroll whitespace-nowrap">{displayTitle}</p>  // REMOVE
  {/* REPLACE WITH: */}
  <p className="line-clamp-2 break-words">{note.title || "Untitled"}</p>
</h2>
```

**Text:**
```jsx
<p className="card-text text-gray-500 group-hover:text-gray-200">{displayText}</p>  // REMOVE
{/* REPLACE WITH: */}
<p className="card-text line-clamp-3 break-words">{note.text || ""}</p>
```

### Line-clamp behavior
- `line-clamp-2`: title caps at 2 lines, ellipsis after overflow.
- `line-clamp-3`: text caps at 3 lines, ellipsis after overflow.
- No JavaScript truncation needed; CSS handles it.

### Remove truncation logic
Delete `displayTitle` / `displayText` computed variables and the `substring` logic from `NoteCard.jsx`.

---

## 4. Note Pinning and Archive

### Data model change — `noteUtils.js` / `useNotes.js`

Add two fields to every note object:
```js
{
  id: string,
  title: string,
  text: string,
  color: string,       // existing
  lastModified: string,
  pinned: boolean,    // NEW: default false
  archived: boolean,  // NEW: default false
}
```

### Defaults on new note (in `useNotes.js` `createNote`)
```js
const newNote = {
  id: generateRandomId(),
  title: "Note",
  text: "",
  color: "bg-green-500",
  lastModified: getFormattedDate(),
  pinned: false,     // NEW
  archived: false,   // NEW
};
```

### Sort order in `NotesList.jsx`
```js
const sorted = [...notes].sort((a, b) => {
  // Pinned first
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  // Then by lastModified desc
  return (b.lastModified || "").localeCompare(a.lastModified || "");
});
```

### Filter — hide archived by default
```js
const filtered = React.useMemo(() => {
  const visible = notes.filter(n => !n.archived);  // NEW
  const sorted = [...visible].sort(...);
  // ... search filter logic unchanged
}, [notes, query, searchColorClass]);
```

### Archive drawer / section (new component `ArchivedNotes`)
- Toggle button in `NotesList` header: "Archived" with count badge.
- When expanded: shows archived notes in a separate list below.
- Each archived note has a **Restore** button (sets `archived: false`).
- Archived notes are NOT shown in the main list.

### Pin/Unpin button
- In `NoteCard`: small pin icon button (top-right of card).
- On click: toggles `pinned` boolean, saves note.
- Pinned notes sort above all unpinned notes.

### Archive/Restore button
- In `NoteWindow` dropdown menu: "Archive" (when active note is not archived).
- When viewing an archived note (via archived drawer): "Restore" button instead.
- Sets `archived: true/false`, saves note.

### IPC for pin/archive state changes
Since `saveNote()` writes to localStorage (renderer-only), the main window won't know until it re-reads. The existing `note-modified` IPC flow already handles this — no new IPC channel needed.

---

## 5. Markdown Rendering

### Dependencies
```bash
npm install react-markdown remark-gfm
```

### `EditableText.jsx` change

Currently renders a plain `<textarea>`. Split into two modes:

**Edit mode:** `<textarea>` (existing behavior).
**View mode (toggle):** Rendered markdown via `react-markdown`.

Add a toggle button (eye icon) in the note window toolbar:
```jsx
const [previewMode, setPreviewMode] = useState(false);
```

```jsx
{previewMode ? (
  <div className="prose prose-invert prose-sm max-w-none">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {note.text}
    </ReactMarkdown>
  </div>
) : (
  <textarea ... />
)}
```

### Sanitization
`remark-gfm` handles GitHub Flavored Markdown (tables, strikethrough, task lists). No additional sanitize library needed for basic use — `react-markdown` does not render raw HTML by default. If raw HTML injection becomes a concern later, add `rehype-sanitize`.

### Styling
Wrap in a `<div>` with `prose prose-invert` (Tailwind Typography plugin) for styled output. Add `prose-sm` for compact note display.

---

## 6. Search with Highlighting

### Highlighting approach
Wrap matched substrings in `<mark>` tags. Rendered in `NoteCard` and `NotesList`.

### New utility function — `src/renderer/utils/highlightText.js`
```js
/**
 * Wraps occurrences of `query` in `text` with <mark> tags.
 * Returns an array of React nodes (strings and <mark> elements).
 */
export function highlightText(text, query) {
  if (!query || !query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-yellow-400 text-gray-900 rounded px-0.5">{part}</mark>
      : part
  );
}
```

### `NoteCard.jsx` update
```jsx
import { highlightText } from "../../utils/highlightText";

// In render:
const query = searchQuery || ""; // passed from NotesList
const titleNodes = highlightText(note.title || "Untitled", query);
const textNodes = highlightText(note.text || "", query);

return (
  ...
  <h2>...{titleNodes}</h2>
  <p>{textNodes}</p>
  ...
);
```

### `NotesList.jsx` — pass searchQuery down
```jsx
<NoteCard
  key={note.id}
  note={note}
  searchQuery={searchQuery}   // NEW prop
  onClick={() => onOpenNote(note.id)}
/>
```

### Highlight in archived section
Same approach — pass `searchQuery` to archived note cards.

---

## 7. Window Sizing Constants

### Constants file
Create `src/renderer/utils/windowConstants.js`:
```js
export const MAIN_WINDOW_WIDTH = 430;
export const MAIN_WINDOW_HEIGHT = 625;

export const NOTE_WINDOW_WIDTH = 500;
export const NOTE_WINDOW_HEIGHT = 550;
export const NOTE_WINDOW_MIN_WIDTH = 425;
export const NOTE_WINDOW_MIN_HEIGHT = 350;
```

### `main.js` — replace hardcoded values

```js
// Replace:
// width: width || (app.isPackaged ? 430 : 1500),
// height: height || (app.isPackaged ? 675 : 675),

// With:
const { MAIN_WINDOW_WIDTH, MAIN_WINDOW_HEIGHT } = require('./windowConstants');
// Note: this is main process, so use CommonJS or define constants directly
const MAIN_W = 430;
const MAIN_H = 625;
width: width || (app.isPackaged ? MAIN_W : 1500),
height: height || (app.isPackaged ? MAIN_H : 675),
```

For `createNoteWindow`:
```js
// Replace:
// width: width || (app.isPackaged ? 425 : 1500),
// height: height || 350,

const NOTE_W = 500;
const NOTE_H = 550;
const NOTE_MIN_W = 425;
const NOTE_MIN_H = 350;

width: width || (app.isPackaged ? NOTE_W : 1500),
height: height || NOTE_H,
minWidth: NOTE_MIN_W,
minHeight: NOTE_MIN_H,
```

### `MainWindow.jsx` — update container dimensions
```jsx
// Replace:
// <div className="flex h-[625px] w-[430px] ...

// With (import constants):
<div className={`flex h-[${MAIN_WINDOW_HEIGHT}px] w-[${MAIN_WINDOW_WIDTH}px] ...`}>
```
Note: Tailwind JIT uses static pixel values in brackets at build time. For dynamic values, use inline styles:
```jsx
<div style={{ height: MAIN_WINDOW_HEIGHT, width: MAIN_WINDOW_WIDTH }}>
```

### Constants summary

| Window | Width | Height | Min Width | Min Height |
|--------|-------|--------|-----------|------------|
| Main   | 430   | 625    | — (fixed) | — (fixed)  |
| Note   | 500   | 550    | 425       | 350        |
