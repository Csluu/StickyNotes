// components/main/WindowControls.jsx
import React from "react";

export default function WindowControls({ draggable = true }) {
  return (
    <div className={`flex flex-row ${draggable ? "" : "no-drag"}`}>
      <button
        onClick={() => window.electronAPI.minimizeWindow()}
        className="no-drag group flex h-8 w-8 items-center justify-center rounded-lg opacity-50 transition-all duration-150 hover:scale-110 hover:opacity-100"
        aria-label="Minimize"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path style={{ fill: "gray" }} d="M 4 7 L 4 9 L 12 9 L 12 7 L 4 7 z" />
        </svg>
      </button>
      <button
        onClick={() => window.electronAPI.closeWindow()}
        className="no-drag group flex h-8 w-8 items-center justify-center rounded-lg opacity-50 transition-all duration-150 hover:scale-105 hover:opacity-100"
        aria-label="Quit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" version="1.1">
          <path
            style={{ fill: "#ff0000" }}
            d="M 5,4 C 4.4477,4 4,4.4477 4,5 4,5.2652 4.1055,5.5195 4.293,5.707 L 10.293,11.707 C 10.48,11.895 10.735,12 11,12 11.552,12 12,11.552 12,11 12,10.735 11.895,10.48 11.707,10.293 L 5.707,4.293 C 5.5195,4.1055 5.2652,4 5,4 Z"
          />
          <path
            style={{ fill: "#ff0000" }}
            d="M 5,12 C 4.4477,12 4,11.552 4,11 4,10.735 4.1055,10.48 4.293,10.293 L 10.293,4.293 C 10.48,4.105 10.735,4 11,4 11.552,4 12,4.448 12,5 12,5.265 11.895,5.52 11.707,5.707 L 5.707,11.707 C 5.5195,11.895 5.2652,12 5,12 Z"
          />
        </svg>
      </button>
    </div>
  );
}
