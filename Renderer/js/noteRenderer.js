// noteText
// noteTitle
// noteColor

window.addEventListener("DOMContentLoaded", () => {
	// Retrieve all noteTitles and noteTexts
	const noteTitles = document.querySelectorAll("#noteTitle");
	const noteTexts = document.querySelectorAll("#noteText");

	noteTitles.forEach((noteTitle, index) => {
		const id = noteTitle.dataset.id;

		// Load data from local storage
		const noteData = JSON.parse(localStorage.getItem(`note-${id}`)) || {
			id: id,
		};
		noteTitle.innerText = noteData.title || "";

		noteTitle.addEventListener("input", (event) => {
			// Save data to local storage
			noteData.title = event.target.innerText;
			noteData.lastModified = getFormattedDate();
			localStorage.setItem(`note-${id}`, JSON.stringify(noteData));
		});

		const noteText = noteTexts[index];
		noteText.innerText = noteData.text || "";

		noteText.addEventListener("input", (event) => {
			// Save data to local storage
			noteData.text = event.target.innerText;
			noteData.lastModified = getFormattedDate();
			localStorage.setItem(`note-${id}`, JSON.stringify(noteData));
		});
	});
});

// Function to get last modification time of a note
function getLastModifiedTime(noteId) {
	const noteData = JSON.parse(localStorage.getItem(`note-${noteId}`));
	if (noteData && noteData.lastModified) {
		return noteData.lastModified;
	} else {
		return null;
	}
}

// Function to get current date in month/day/year format
function getFormattedDate() {
	const date = new Date();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const year = date.getFullYear();

	return `${month}/${day}/${year}`;
}

// Usage:
const lastModifiedTime = getLastModifiedTime("uniqueNoteId1");
console.log(lastModifiedTime);

window.onload = () => {
	console.log("Window loaded");
	let resizing = false;
	const resizeDiv = document.getElementById("resizeDiv");
	console.log("Div: ", resizeDiv);

	resizeDiv.addEventListener("mousedown", (e) => {
		e.preventDefault();
		resizing = true;
		console.log("MouseDown: ", resizing);
	});

	document.addEventListener("mousemove", (e) => {
		if (resizing) {
			console.log("MouseMove: ", e.clientX, e.clientY);
			window.electronAPI.resizeWindow(e.clientX + 50, e.clientY + 50);
		}
	});

	document.addEventListener("mouseup", (e) => {
		resizing = false;
		console.log("MouseUp: ", resizing);
	});
};

function toggleDropDown(dropDown, menu) {
	menu.addEventListener("click", () => {
		dropDown.classList.toggle("hidden");
	});
}

toggleDropDown(
	document.getElementById("drop-down-1"),
	document.getElementById("menu-1")
);

function toggleLock() {
	const menuLock1 = document.getElementById("lock-menu-1");
	const container = document.getElementById("body");

	menuLock1.addEventListener("click", () => {
		container.classList.toggle("no-drag");
	});
}
toggleLock();

document.getElementById("noteWindow").addEventListener("click", () => {
	window.electron.newWindow();
});
