// components/main/EmptyState.jsx
import React from "react";

export default function EmptyState({ onCreateNote }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Sticky note SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        className="text-gray-500 mb-4"
      >
        <path
          fill="currentColor"
          d="M3 3h18v18H3V3Zm16 16V5H5v14h14ZM7 7h4v4H7V7Zm6 0h4v4h-4V7Zm-6 6h4v4H7v-4Zm6 0h4v4h-4v-4Z"
        />
      </svg>

      <h2 className="text-xl font-semibold text-gray-400">No notes yet</h2>
      <p className="text-sm text-gray-500 mt-1">Create your first note to get started</p>

      <button
        onClick={onCreateNote}
        className="mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 font-medium transition-colors"
      >
        Create Note
      </button>
    </div>
  );
}
