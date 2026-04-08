import React, { useState, useEffect } from "react";
import { NotesProvider } from "../../context/NotesContext";
import { useNotesContext } from "../../context/NotesContext";
import DropdownMenu, { DropdownItem } from "./DropdownMenu";
import WindowControls from "./WindowControls";
import SearchBar from "./SearchBar";
import NotesList from "./NotesList";

function MainWindowInner() {
  const { notes, createNote } = useNotesContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Listen for updates from note windows — force re-render to refresh notes from localStorage
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.electronAPI.onUpdateNotesList(handler);
    return () => {};
  }, []);

  const handleNewNote = () => {
    const id = createNote();
    window.electronAPI.createNewWindow(id);
  };

  const handleOpenNote = (id) => {
    window.electronAPI.createNewWindow(id);
  };

  const toggleLock = () => { setIsLocked((v) => !v); };

  return (
    <div className="flex h-[625px] w-[430px] flex-col place-items-center justify-start">
      <div className="mx-4 flex w-full flex-row place-items-start justify-center gap-6 p-4">
        <section
          id="menuBody"
          className={`container max-h-[625px] overflow-scroll ${isLocked ? "" : "yes-drag"}`}
        >
          <header className="ml-2 mt-6 flex flex-row justify-between">
            <div className="no-drag flex w-fit select-none flex-row place-items-center">
              <div className="h-5 w-5 rounded-full bg-green-500"></div>
              <div className="rounded-lg px-2 text-xl font-semibold text-gray-500 shadow-sm outline-none">
                Notes
              </div>
            </div>

            <div className="no-drag flex flex-row">
              <DropdownMenu>
                <div className="py-2">
                  <h1 className="block px-4 text-sm text-gray-400">Main Menu</h1>
                </div>
                <ul className="text-sm text-gray-200 divide-y divide-dark-gray-highlight">
                  <DropdownItem onClick={toggleLock}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      className="duration-150 ease-in-out group-hover:scale-105 group-hover:opacity-100"
                    >
                      <path
                        fill="gray"
                        d={isLocked
                          ? "M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z"
                          : "M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8Zm6 9q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17Z"}
                      />
                    </svg>
                    <span className="py-[10px] duration-150 ease-in-out group-hover:scale-[102%]">
                      {isLocked ? "Unlock" : "Lock"}
                    </span>
                  </DropdownItem>
                  <DropdownItem onClick={() => window.electronAPI.minimizeWindow()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      className="opacity-50 group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-150"
                    >
                      <path fill="gray" d="M 4 7 L 4 9 L 12 9 L 12 7 L 4 7 z" />
                    </svg>
                    <span className="py-[10px] duration-150 ease-in-out group-hover:scale-[102%] h-full">
                      Minimize
                    </span>
                  </DropdownItem>
                  <DropdownItem onClick={() => window.electronAPI.closeWindow()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      version="1.1"
                      className="opacity-50 group-hover:opacity-100 group-hover:scale-105 ease-in-out duration-150"
                    >
                      <path fill="gray" d="M 5,4 C 4.4477,4 4,4.4477 4,5 4,5.2652 4.1055,5.5195 4.293,5.707 L 10.293,11.707 C 10.48,11.895 10.735,12 11,12 11.552,12 12,11.552 12,11 12,10.735 11.895,10.48 11.707,10.293 L 5.707,4.293 C 5.5195,4.1055 5.2652,4 5,4 Z" />
                      <path fill="gray" d="M 5,12 C 4.4477,12 4,11.552 4,11 4,10.735 4.1055,10.48 4.293,10.293 L 10.293,4.293 C 10.48,4.105 10.735,4 11,4 11.552,4 12,4.448 12,5 12,5.265 11.895,5.52 11.707,5.707 L 5.707,11.707 C 5.5195,11.895 5.2652,12 5,12 Z" />
                    </svg>
                    <span className="py-[10px] duration-150 ease-in-out group-hover:scale-[102%] h-full">
                      Quit
                    </span>
                  </DropdownItem>
                </ul>
              </DropdownMenu>

              <button
                onClick={handleNewNote}
                className="no-drag newNoteButton flex h-8 w-8 place-items-center justify-center rounded-lg"
                aria-label="New note"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="opacity-50 transition-all duration-150 hover:scale-110 hover:opacity-100"
                >
                  <path
                    fill="gray"
                    d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2z"
                  />
                </svg>
              </button>
            </div>
          </header>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <NotesList
            notes={notes}
            searchQuery={searchQuery}
            onOpenNote={handleOpenNote}
            onCreateNote={handleNewNote}
          />
        </section>
      </div>
    </div>
  );
}

export default function MainWindow() {
  return (
    <NotesProvider>
      <MainWindowInner />
    </NotesProvider>
  );
}
