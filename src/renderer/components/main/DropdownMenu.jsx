// components/main/DropdownMenu.jsx
import React from "react";
import WindowControls from "./WindowControls";

export default function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="menu-1"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="menu"
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
            d="M7 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"
          />
        </svg>
      </button>

      {open && (
        <div
          id="drop-down-1"
          className="drop-menu no-drag absolute right-0 top-full z-20 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ onClick, children }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="no-drag group select-none"
      >
        {children}
      </button>
    </li>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 border-t border-gray-600" />;
}
