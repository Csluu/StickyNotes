// components/note/EditableText.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function EditableText({ initialValue, onChange, readOnly = false, className = "" }) {
  const [value, setValue] = useState(initialValue || "");
  const [previewMode, setPreviewMode] = useState(false);
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
    onChange(newValue);
  };

  const togglePreview = () => setPreviewMode((v) => !v);

  const lines = value.split("\n");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toggle button */}
      <div className="no-drag flex justify-end mb-1">
        <button
          onClick={togglePreview}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded bg-gray-800"
          aria-label={previewMode ? "Edit" : "Preview markdown"}
        >
          {previewMode ? "Edit" : "Preview"}
        </button>
      </div>

      {previewMode ? (
        <div className={`prose prose-invert prose-sm max-w-none flex-1 overflow-scroll px-2 ${className}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || " "}</ReactMarkdown>
        </div>
      ) : (
        <section
          ref={ref}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={() => { if (onChange && value !== initialValue) onChange(value); }}
          data-placeholder="Type something..."
          className={`no-drag overflow-scroll px-2 text-gray-200 outline-none min-h-[1.5em] ${readOnly ? "pointer-events-none" : ""} ${className}`}
        >
          {value}
        </section>
      )}
    </div>
  );
}
