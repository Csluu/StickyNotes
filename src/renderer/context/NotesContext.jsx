import { createContext, useContext } from "react";
import { useNotes } from "../hooks/useNotes";

export const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const notesState = useNotes();
  return (
    <NotesContext.Provider value={notesState}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotesContext must be used inside <NotesProvider>");
  return ctx;
}
