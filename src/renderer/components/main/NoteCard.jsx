// components/main/NoteCard.jsx
import React, { useCallback } from "react";
import { formatDate } from "../../utils/noteUtils";
import { highlightText } from "../../utils/highlightText";

export default function NoteCard({
	note,
	onClick,
	searchQuery = "",
	isArchived = false,
}) {
	const handlePin = useCallback(
		(e) => {
			e.stopPropagation();
			const updated = { ...note, pinned: !note.pinned };
			window.electronAPI?.saveNote?.(updated) ||
				window.electronAPI?.updateNote?.(note.id);
			// Use localStorage directly for pin toggle
			try {
				const stored = localStorage.getItem("notes");
				if (stored) {
					const notes = JSON.parse(stored);
					const idx = notes.findIndex((n) => n.id === note.id);
					if (idx >= 0) {
						notes[idx] = { ...notes[idx], pinned: !notes[idx].pinned };
						localStorage.setItem("notes", JSON.stringify(notes));
						// Notify main window
						window.electronAPI?.noteModified?.();
					}
				}
			} catch {}
		},
		[note],
	);

	const handleRestore = useCallback(
		(e) => {
			e.stopPropagation();
			try {
				const stored = localStorage.getItem("notes");
				if (stored) {
					const notes = JSON.parse(stored);
					const idx = notes.findIndex((n) => n.id === note.id);
					if (idx >= 0) {
						notes[idx] = { ...notes[idx], archived: false };
						localStorage.setItem("notes", JSON.stringify(notes));
						window.electronAPI?.noteModified?.();
					}
				}
			} catch {}
		},
		[note],
	);

	const title = note.title || "Untitled";
	const text = note.text || "";

	return (
		<div
			data-id={note.id}
			onClick={onClick}
			className="card gap-2 py-5 cursor-pointer noteWindow hover:bg-blue-600 hover:scale-[102%] hover:border-blue-500 group transition duration-75 ease-in-out"
		>
			{/* Row 1: title + date + pin button */}
			<header className="flex flex-row items-center justify-between gap-2 card-text w-full">
				<div className="flex flex-row items-center gap-2 min-w-0 flex-1">
					<span
						className={`${note.color || "bg-green-500"} w-3 h-3 rounded-full flex-shrink-0`}
					/>
					<p className="line-clamp-2 break-words min-w-0 flex-1 text-sm font-semibold">
						{highlightText(title, searchQuery)}
					</p>
				</div>
				<div className="flex flex-row items-center gap-1 flex-shrink-0">
					{isArchived ? (
						<button
							onClick={handleRestore}
							className="p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-blue-400 hover:text-blue-300"
							aria-label="Restore"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18z"
								/>
							</svg>
						</button>
					) : (
						<button
							onClick={handlePin}
							className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
							aria-label={note.pinned ? "Unpin" : "Pin"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								className={note.pinned ? "text-yellow-400" : "text-gray-400"}
							>
								<path
									fill="currentColor"
									d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z"
								/>
							</svg>
						</button>
					)}
					<p className="text-gray-500 group-hover:text-gray-200 text-xs whitespace-nowrap">
						{formatDate(note.lastModified)}
					</p>
				</div>
			</header>

			{/* Row 2: text preview */}
			<p className="line-clamp-3 break-words text-gray-500 group-hover:text-gray-200 text-xs pl-5">
				{highlightText(text.replace(/\n/g, " "), searchQuery)}
			</p>

			{isArchived && (
				<div className="mt-1">
					<button
						onClick={handleRestore}
						className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
					>
						Restore
					</button>
				</div>
			)}
		</div>
	);
}
