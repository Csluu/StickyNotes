import React, { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function EditableText({
	initialValue,
	onChange,
	readOnly = false,
	previewMode = false, // ← now a prop
	className = "",
}) {
	const [value, setValue] = useState(initialValue || "");
	const ref = useRef(null);

	const callbackRef = useCallback(
		(node) => {
			if (node) {
				node.innerText = value;
				ref.current = node;
			}
		},
		[previewMode],
	);

	const handleInput = (e) => {
		if (readOnly) return;
		const newValue = e.target.innerText;
		setValue(newValue);
		onChange(newValue);
	};

	return (
		<div className="flex flex-col flex-1 min-h-0">
			{previewMode ? (
				<div
					className={`prose prose-invert prose-sm max-w-none flex-1 overflow-scroll px-2 ${className}`}
				>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{value || " "}
					</ReactMarkdown>
				</div>
			) : (
				<section
					ref={callbackRef}
					contentEditable={!readOnly}
					suppressContentEditableWarning
					onInput={handleInput}
					onBlur={() => {
						if (onChange && value !== initialValue) onChange(value);
					}}
					data-placeholder="Type something..."
					className={`no-drag overflow-scroll px-2 text-gray-200 outline-none min-h-[1.5em] ${readOnly ? "pointer-events-none" : ""} ${className}`}
				/>
			)}
		</div>
	);
}
