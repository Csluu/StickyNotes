import { useState, useEffect, useCallback } from "react";
import { generateRandomId, getFormattedDate } from "../utils/noteUtils";

const STORAGE_KEY = "notes";

/**
 * Shared notes state hook backed by localStorage.
 * Both the main window and note windows use this — writes from one
 * window are re-read on the next render to stay in sync.
 */
export function useNotes() {
	const [notes, setNotes] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	});

	// Re-read from storage when note windows dispatch a custom event after saving
	// Also listen to IPC event from main process for Electron-based sync
	useEffect(() => {
		const handler = () => {
			try {
				const stored = localStorage.getItem(STORAGE_KEY);
				if (stored) setNotes(JSON.parse(stored));
			} catch {}
		};
		window.addEventListener("notes-updated", handler);
		// Also listen for IPC event from main process
		const ipcHandler = () => handler();
		if (window.electronAPI?.onUpdateNotesList) {
			window.electronAPI.onUpdateNotesList(ipcHandler);
		}
		return () => {
			window.removeEventListener("notes-updated", handler);
		};
	}, []);

	const saveNotes = useCallback((updated) => {
		setNotes(updated);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	}, []);

	/**
	 * Persist an updated note object. Handles both create and update.
	 */
	const saveNote = useCallback((note) => {
		setNotes((prev) => {
			const existing = prev.find((n) => n.id === note.id);
			const updated = existing
				? prev.map((n) => (n.id === note.id ? note : n))
				: [...prev, note];
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			// Notify all windows (including this one) to re-read from storage
			window.dispatchEvent(new Event("notes-updated"));
			return updated;
		});
	}, []);

	/**
	 * Delete a note by id and tell the main window to refresh.
	 */
	const deleteNote = useCallback((noteId) => {
		setNotes((prev) => {
			const updated = prev.filter((n) => n.id !== noteId);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			window.dispatchEvent(new Event("notes-updated")); // ← add this
			return updated;
		});
		window.electronAPI.noteModified(); // already there, keeps it
	}, []);

	/**
	 * Create a brand-new note and return its id.
	 */
	const createNote = useCallback(() => {
		const id = generateRandomId();
		const newNote = {
			id,
			title: "Note",
			text: "",
			color: "bg-green-500",
			lastModified: getFormattedDate(),
			pinned: false,
			archived: false,
			locked: false,
		};
		saveNote(newNote);
		return id;
	}, [saveNote]);

	/**
	 * Find a single note by id (reads fresh from storage each call).
	 */
	const getNote = useCallback((id) => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (!stored) return null;
			return JSON.parse(stored).find((n) => n.id === id) || null;
		} catch {
			return null;
		}
	}, []);

	return { notes, saveNote, deleteNote, createNote, getNote };
}
