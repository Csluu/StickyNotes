// components/main/ColorPicker.jsx
import React from "react";

export const NOTE_COLORS = [
  { name: "blue",   class: "bg-blue-500"   },
  { name: "red",    class: "bg-red-500"     },
  { name: "green",  class: "bg-green-500"    },
  { name: "yellow", class: "bg-yellow-500"  },
  { name: "orange", class: "bg-orange-500"  },
  { name: "pink",   class: "bg-pink-500"    },
];

export default function ColorPicker({ selectedColor, onChange, buttonId = "color-drop-down" }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        id={buttonId}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className={`no-drag flex h-5 w-5 items-center justify-center rounded-full ${selectedColor || "bg-green-500"}`}
        aria-label="Choose color"
      />
      {open && (
        <div
          id="color-menu"
          className="no-drag absolute z-10 mt-1 left-0 flex w-24 flex-col items-center justify-center gap-1 divide-dark-gray-highlight rounded-xl border-[1px] border-black bg-opaque-dark-gray pb-4 pt-2 shadow-border"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex w-full items-center justify-center">
            <h1 className="text-sm text-gray-400">Bullet Color</h1>
          </header>
          <div className="grid w-[74px] grid-cols-3 grid-rows-2 gap-2">
            {NOTE_COLORS.map(({ name, class: cls }) => (
              <button
                key={name}
                className={`color-btn col-span-1 row-span-1 h-5 w-5 rounded-sm ${cls} hover:scale-110`}
                onClick={() => { onChange(cls); setOpen(false); }}
                aria-label={name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
