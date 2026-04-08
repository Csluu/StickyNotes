// utils/noteUtils.js

/**
 * Generate a random UUID v4 compatible string.
 */
export function generateRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Return current date formatted as YYYY/MM/DD HH:MM:SS
 */
export function getFormattedDate() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

/**
 * Format an ISO date string for display (e.g. "Jan 1, 2025")
 */
export function formatDate(isoDateString) {
  if (!isoDateString) return "";
  const date = new Date(isoDateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
