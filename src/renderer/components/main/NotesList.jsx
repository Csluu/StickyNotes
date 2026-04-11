// components/main/NotesList.jsx
import React, { useState } from "react";
import NoteCard from "./NoteCard";
import EmptyState from "./EmptyState";

export default function NotesList({
	notes,
	searchQuery,
	onOpenNote,
	onCreateNote,
}) {
	const [showArchived, setShowArchived] = useState(false);

	const colorMap = {
		red: "bg-red-500",
		blue: "bg-blue-500",
		green: "bg-green-500",
		yellow: "bg-yellow-500",
		orange: "bg-orange-500",
		pink: "bg-pink-500",
	};

	const query = searchQuery.toLowerCase().trim();
	const searchColorClass = colorMap[query];

	// Sort: pinned first, then by lastModified desc, then filter
	const { visible, archived } = React.useMemo(() => {
		const visibleNotes = notes.filter((n) => !n.archived);
		const archivedNotes = notes.filter((n) => n.archived);

		const sortFn = (a, b) => {
			if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
			return (b.lastModified || "").localeCompare(a.lastModified || "");
		};

		return {
			visible: visibleNotes.sort(sortFn),
			archived: archivedNotes.sort(sortFn),
		};
	}, [notes]);

	const filtered = React.useMemo(() => {
		if (!query) return visible;

		return visible.filter((note) => {
			if (searchColorClass) {
				return note.color === searchColorClass;
			}
			const title = (note.title || "").toLowerCase();
			const text = (note.text || "").toLowerCase();
			return title.includes(query) || text.includes(query);
		});
	}, [visible, query, searchColorClass]);

	const archivedCount = archived.length;

	return (
		<section
			id="noteCardsContainer"
			className="swim-lane no-drag overflow-scroll rounded-xl text-base text-gray-200"
		>
			{notes.length === 0 ? (
				<EmptyState onCreateNote={onCreateNote} />
			) : (
				<>
					{filtered.map((note) => (
						<NoteCard
							key={note.id}
							note={note}
							searchQuery={searchQuery}
							onClick={() => onOpenNote(note.id)}
						/>
					))}

					{archivedCount > 0 && (
						<div className="mt-4 border-t border-gray-700 pt-3">
							<button
								onClick={() => setShowArchived((v) => !v)}
								className="flex w-full items-center gap-2 px-2 py-1 text-sm text-gray-500 hover:text-gray-300"
							>
								<span>Archived</span>
								<span className="rounded bg-gray-700 px-1.5 text-xs">
									{archivedCount}
								</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="12"
									height="12"
									viewBox="0 0 24 24"
									className={`transition-transform ${showArchived ? "rotate-180" : ""}`}
								>
									<path fill="currentColor" d="M7 10l5 5 5-5H7z" />
								</svg>
							</button>

							{showArchived && (
								<div className="mt-2 flex flex-col gap-4">
									{" "}
									{/* match whatever gap swim-lane uses */}
									{archived.map((note) => (
										<NoteCard
											key={note.id}
											note={note}
											searchQuery={searchQuery}
											onClick={() => onOpenNote(note.id)}
										/>
									))}
								</div>
							)}
						</div>
					)}
				</>
			)}
		</section>
	);
}
