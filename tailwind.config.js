/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/**/*.{html,js,jsx,tsx}", "./src/renderer/index.html", "./src/renderer/note.html"],
  theme: {
    extend: {
      colors: {
        "clear-blue": "rgba(112, 179, 226, 1.0)",
        "clear-dark-gray": "rgba(25, 25, 25, 0.75)",
        "opaque-dark-gray": "rgba(36, 36, 36, 1)",
        "dark-gray-highlight": "rgb(55, 55, 55)",
        "block-gray": "rgba(32, 40, 51, .80)",
      },
      fontFamily: { quicksand: ["Quicksand", "sans-serif"] },
      boxShadow: {
        border:
          "0 3px 10px 2px rgba(0, 0, 0, 0.5), 0 5px 15px 2px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(87,88,89,0.66), inset 0 0 5px rgba(87,88,89,0.66)",
        highLight:
          "0 -1px 0px 0px rgba(2, 6, 23, 1), 0 4px 6px -1px rgba(2, 6, 23, 1), 0 2px 4px -1px rgba(2, 6, 23, 1)",
      },
      dropShadow: {
        "text-outline": [
          "-1px -1px 0 black",
          "1px -1px 0 black",
          "-1px 1px 0 black",
          "1px 1px 0 black",
        ],
      },
    },
  },
  plugins: [],
};
