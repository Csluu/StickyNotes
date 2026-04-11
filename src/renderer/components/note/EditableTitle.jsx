import React, { useState, useRef, useCallback } from "react";

export default function EditableTitle({
	initialValue,
	onChange,
	readOnly = false,
	className = "",
}) {
	const [value, setValue] = useState(initialValue || "Note");
	const ref = useRef(null);

	const callbackRef = useCallback((node) => {
		if (node) {
			node.innerText = value;
			ref.current = node;
		}
	}, []); // only runs on mount — title doesn't toggle like preview mode

	const handleInput = (e) => {
		if (readOnly) return;
		const newValue = e.target.innerText;
		setValue(newValue);
		onChange(newValue || "Untitled");
	};

	return (
		<div
			ref={callbackRef}
			contentEditable={!readOnly}
			suppressContentEditableWarning
			onInput={handleInput}
			data-placeholder="Untitled"
			className={`min-w-[100px] flex-nowrap overflow-scroll whitespace-nowrap text-xl font-semibold text-gray-500 outline-none ${readOnly ? "pointer-events-none" : ""} ${className}`}
		/>
	);
}
