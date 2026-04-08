// components/note/LockToggle.jsx
import React from "react";

const LOCKED_PATH = "M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z";
const UNLOCKED_PATH = "M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8Zm6 9q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17Z";

export default function LockToggle({ containerId = "noteBody", locked = false, onToggle }) {
  const handleClick = () => {
    const container = document.getElementById(containerId);
    if (container) container.classList.toggle("yes-drag");
    if (onToggle) onToggle(!locked);
  };

  return (
    <button onClick={handleClick} className="lock-menu group flex flex-row items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className="transition-all duration-150 group-hover:scale-105"
      >
        <path id="lock-icon" fill="currentColor" d={locked ? UNLOCKED_PATH : LOCKED_PATH} />
      </svg>
      <span id="lock-text" className="text-xs text-gray-400 group-hover:text-gray-200">
        {locked ? "Unlock" : "Lock"}
      </span>
    </button>
  );
}