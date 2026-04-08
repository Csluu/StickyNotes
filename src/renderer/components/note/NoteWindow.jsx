import React, { useState, useEffect, useCallback } from "react";
import ColorPicker from "../main/ColorPicker";
import DropdownMenu, { DropdownItem } from "../main/DropdownMenu";
import EditableTitle from "./EditableTitle";
import EditableText from "./EditableText";
import LockToggle from "./LockToggle";
import ResizeHandle from "./ResizeHandle";
import { useNotes } from "../../hooks/useNotes";
import { getFormattedDate } from "../../utils/noteUtils";

function getNoteIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

export default function NoteWindow() {
  const { getNote, saveNote, deleteNote } = useNotes();
  const [note, setNote] = useState(null);
  const [noteId, setNoteId] = useState(null);

  useEffect(() => {
    setNoteId(getNoteIdFromUrl());
    const handler = (event, receivedId) => { setNoteId(receivedId); };
    window.electronAPI.onNoteData(handler);

    // Set note window to default size on mount (dev mode fix)
    window.electronAPI.resizeWindow?.(500, 550);
    return () => {};
  }, []);

  useEffect(() => {
    if (!noteId) return;
    const n = getNote(noteId);
    if (n) {
      setNote(n);
    } else {
      setNote({
        id: noteId,
        title: "Note",
        text: "",
        color: "bg-green-500",
        lastModified: getFormattedDate(),
        pinned: false,
        archived: false,
        locked: false,
      });
    }
  }, [noteId, getNote]);

  const handleTitleChange = useCallback((title) => {
    if (!note) return;
    const updated = { ...note, title, lastModified: getFormattedDate() };
    setNote(updated);
    saveNote(updated);
    window.electronAPI.updateNote(noteId);
    window.electronAPI.noteModified();
  }, [note, saveNote, noteId]);

  const handleTextChange = useCallback((text) => {
    if (!note) return;
    const updated = { ...note, text, lastModified: getFormattedDate() };
    setNote(updated);
    saveNote(updated);
    window.electronAPI.updateNote(noteId);
    window.electronAPI.noteModified();
  }, [note, saveNote, noteId]);

  const handleColorChange = useCallback((color) => {
    if (!note) return;
    const updated = { ...note, color, lastModified: getFormattedDate() };
    setNote(updated);
    saveNote(updated);
    window.electronAPI.updateNote(noteId);
    window.electronAPI.noteModified();
  }, [note, saveNote, noteId]);

  const handleArchive = useCallback(() => {
    if (!note) return;
    const updated = { ...note, archived: true, lastModified: getFormattedDate() };
    saveNote(updated);
    window.electronAPI.noteModified();
    window.electronAPI.closeWindow();
  }, [note, saveNote]);

  const handleRestore = useCallback(() => {
    if (!note) return;
    const updated = { ...note, archived: false, lastModified: getFormattedDate() };
    saveNote(updated);
    window.electronAPI.noteModified();
    window.electronAPI.closeWindow();
  }, [note, saveNote]);

  const handleDelete = useCallback(async () => {
    if (!note) return;
    const response = await window.electronAPI.showConfirmationDialog({
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 1,
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this note?",
    });
    if (response === 0) {
      deleteNote(note.id);
      window.electronAPI.quitNote(note.id);
      window.electronAPI.closeWindow();
    }
  }, [note, deleteNote]);

  const handleToggleLock = useCallback(() => {
    if (!note) return;
    const updated = { ...note, locked: !note.locked, lastModified: getFormattedDate() };
    setNote(updated);
    saveNote(updated);
  }, [note, saveNote]);

  const handleToggleTransparent = useCallback(() => {
    document.getElementById("body")?.classList?.toggle("opacity-75");
    if (note) window.electronAPI.toggleAlwaysOnTop(note.id);
  }, [note]);

  const handleQuit = useCallback(() => {
    if (note) window.electronAPI.quitNote(note.id);
    window.electronAPI.closeWindow();
  }, [note]);

  const handleOpenMain = useCallback(() => {
    window.electronAPI.showMainWindow();
  }, []);

  const handleNewNote = useCallback(() => {
    const { generateRandomId } = require("../../utils/noteUtils");
    window.electronAPI.createNewWindow(generateRandomId());
  }, []);

  if (!note) return null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="no-drag flex h-full w-full flex-row items-stretch justify-start gap-0 overflow-hidden p-0">
        <section
          id="noteBody"
          className="note-card yes-drag relative flex h-full w-full flex-col gap-2 overflow-y-auto px-6 pb-12"
        >
          <header className="mt-6 flex flex-row justify-between gap-2">
            <span className="flex place-items-center justify-center">
              <ColorPicker
                buttonId="color-drop-down"
                selectedColor={note.color}
                onChange={handleColorChange}
              />
            </span>

            <div className="no-drag flex w-full select-none flex-row place-items-center overflow-scroll">
              <EditableTitle initialValue={note.title} onChange={handleTitleChange} />
            </div>

            <div className="no-drag flex flex-row items-start gap-1">
              <DropdownMenu>
                <ul className="text-sm text-gray-200">
                  <DropdownItem onClick={handleOpenMain}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M3 3h18v18H3V3Zm16 16V5H5v14h14ZM7 7h4v4H7V7Zm6 0h4v4h-4V7Zm-6 6h4v4H7v-4Zm6 0h4v4h-4v-4Z" />
                    </svg>
                    <span>Main Menu</span>
                  </DropdownItem>
                  <DropdownItem onClick={handleToggleTransparent}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                      <path fill="currentColor" d="M10 2a4 4 0 1 0 3.123 6.5H10v-1h3.71c.127-.315.215-.65.26-1H10v-1h3.97a3.973 3.973 0 0 0-.26-1H10v-1h3.123A3.993 3.993 0 0 0 10 2Zm-4.991 9A2.001 2.001 0 0 0 3 13c0 1.691.833 2.966 2.135 3.797C6.417 17.614 8.145 18 10 18c1.694 0 3.282-.322 4.52-1H10v-1h5.836c.283-.3.522-.636.708-1.005H10v-1h6.896A4.69 4.69 0 0 0 17 13v-.005h-7v-1h6.73A2 2 0 0 0 15 11H5.009Z" />
                    </svg>
                    <span>Incognito</span>
                  </DropdownItem>
                  <DropdownItem onClick={handleToggleLock}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      className="duration-150 ease-in-out group-hover:scale-105 group-hover:opacity-100"
                    >
                      <path
                        fill="gray"
                        d={note.locked
                          ? "M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z"
                          : "M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8Zm6 9q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17Z"}
                      />
                    </svg>
                    <span className="py-[10px] duration-150 ease-in-out group-hover:scale-[102%]">
                      {note.locked ? "Unlock" : "Lock"}
                    </span>
                  </DropdownItem>
                  {note.archived ? (
                    <>
                      <DropdownItem onClick={handleRestore}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12.5 3C7.81 3 4 6.81 4 11.5S7.81 20 12.5 20h.5V18H12.5C8.92 18 6 15.08 6 11.5S8.92 5 12.5 5C14.73 5 16.65 6.27 17.82 8.08L16.5 9.5H20V6l-2.5 2.25C16.41 6.89 14.54 6 12.5 6 9.46 6 7 8.46 7 11.5c0 1.18.38 2.29 1.07 3.19L7 16h4v4h2v-4h4l-1.5-1.85C18.5 12.69 19 11.58 19 10.5 19 6.91 15.5 3 12.5 3Z" />
                        </svg>
                        <span>Restore</span>
                      </DropdownItem>
                      <DropdownItem onClick={handleDelete} danger>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="opacity-50">
                          <path fill="currentColor" d="m9.4 16.5l2.6-2.6l2.6 2.6l1.4-1.4l-2.6-2.6L16 9.9l-1.4-1.4l-2.6 2.6l-2.6-2.6L8 9.9l2.6 2.6L8 15.1l1.4 1.4ZM7 21q-.825 0-1.413-.588T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.588 1.413T17 21H7Z" />
                        </svg>
                        <span>Delete</span>
                      </DropdownItem>
                    </>
                  ) : (
                    <DropdownItem onClick={handleArchive}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 3h18v18H3V3Zm16 16V5H5v14h14ZM7 7h4v4H7V7Zm6 0h4v4h-4V7Zm-6 6h4v4H7v-4Zm6 0h4v4h-4v-4Z" />
                      </svg>
                      <span>Archive</span>
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => window.electronAPI.minimizeWindow()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="opacity-50">
                      <path style={{ fill: "currentColor" }} d="M 4 7 L 4 9 L 12 9 L 12 7 L 4 7 z" />
                    </svg>
                    <span>Minimize</span>
                  </DropdownItem>
                  <DropdownItem onClick={handleQuit} danger>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" version="1.1" className="opacity-50">
                      <path style={{ fill: "currentColor" }} d="M 5,4 C 4.4477,4 4,4.4477 4,5 4,5.2652 4.1055,5.5195 4.293,5.707 L 10.293,11.707 C 10.48,11.895 10.735,12 11,12 11.552,12 12,11.552 12,11 12,10.735 11.895,10.48 11.707,10.293 L 5.707,4.293 C 5.5195,4.1055 5.2652,4 5,4 Z" />
                      <path style={{ fill: "currentColor" }} d="M 5,12 C 4.4477,12 4,11.552 4,11 4,10.735 4.1055,10.48 4.293,10.293 L 10.293,4.293 C 10.48,4.105 10.735,4 11,4 11.552,4 12,4.448 12,5 12,5.265 11.895,5.52 11.707,5.707 L 5.707,11.707 C 5.5195,11.895 5.2652,12 5,12 Z" />
                    </svg>
                    <span>Quit</span>
                  </DropdownItem>
                </ul>
              </DropdownMenu>

              <button
                onClick={handleNewNote}
                className="no-drag newNoteButton flex h-8 w-8 place-items-center justify-center rounded-lg"
                aria-label="New note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="opacity-50 hover:opacity-100 hover:scale-110">
                  <path fill="gray" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2z" />
                </svg>
              </button>
            </div>
          </header>

          <EditableText initialValue={note.text} onChange={handleTextChange} />
          <ResizeHandle />
        </section>
      </div>
    </div>
  );
}
