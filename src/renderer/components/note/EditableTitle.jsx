// components/note/EditableTitle.jsx
import React, { useState, useRef, useEffect } from "react";

export default function EditableTitle({ initialValue, onChange, readOnly = false, className = "" }) {
  const [value, setValue] = useState(initialValue || "Note");
  const ref = useRef(null);

  useEffect(() => {
    if (initialValue && initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleInput = (e) => {
    if (readOnly) return;
    const newValue = e.target.innerText;
    setValue(newValue);
    onChange(newValue || "Untitled");
  };

  return (
    <div
      ref={ref}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onInput={handleInput}
      data-placeholder="Untitled"
      className={`min-w-[100px] flex-nowrap overflow-scroll whitespace-nowrap text-xl font-semibold text-gray-500 outline-none ${readOnly ? "pointer-events-none" : ""} ${className}`}
    >
      {value}
    </div>
  );
}