// components/note/ResizeHandle.jsx
import React, { useRef, useEffect, useState } from "react";

export default function ResizeHandle() {
  const [resizing, setResizing] = useState(false);
  const initialRef = useRef(null);

  useEffect(() => {
    if (!resizing) return;

    let throttleTimeout = null;

    const onMouseMove = (e) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        const { initialMouseX, initialMouseY, initialWidth, initialHeight } = initialRef.current;
        const newWidth = initialWidth + (e.clientX - initialMouseX);
        const newHeight = initialHeight + (e.clientY - initialMouseY);
        window.electronAPI.resizeWindow(newWidth, newHeight);
        throttleTimeout = null;
      }, 30);
    };

    const onMouseUp = () => setResizing(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [resizing]);

  return (
    <div
      id="resizeDiv"
      className="no-drag absolute bottom-8 right-8 h-5 w-5 cursor-se-resize"
      onMouseDown={(e) => {
        e.preventDefault();
        initialRef.current = {
          initialMouseX: e.clientX,
          initialMouseY: e.clientY,
          initialWidth: window.innerWidth,
          initialHeight: window.innerHeight,
        };
        setResizing(true);
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" className="opacity-50">
        <path
          fill="gray"
          d="M6.7 16L16 6.7V5.3L5.3 16zm3 0L16 9.7V8.3L8.3 16zm3 0l3.3-3.3v-1.4L11.3 16zm3 0l.3-.3v-1.4L14.3 16z"
        />
      </svg>
    </div>
  );
}
