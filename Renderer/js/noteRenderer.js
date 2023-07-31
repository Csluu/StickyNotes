// window.addEventListener("DOMContentLoaded", () => {
// 	// Retrieve all noteTitles and noteTexts
// 	const noteTitles = document.querySelectorAll("#noteTitle");
// 	const noteTexts = document.querySelectorAll("#noteText");

// 	// Load all notes from local storage
// 	let notes = JSON.parse(localStorage.getItem("notes")) || [];

// 	noteTitles.forEach((noteTitle, index) => {
// 		// Generate a unique ID for the note
// 		let id = noteTitle.dataset.id || Date.now().toString();

// 		// Attach the ID to the note element
// 		noteTitle.dataset.id = id;

// 		// Load data from the notes array
// 		let noteData = notes.find((note) => note.id === id) || {};
// 		noteTitle.innerText = noteData.title || "Notes";

// 		noteTitle.addEventListener("input", (event) => {
// 			// Save data to the notes array
// 			noteData.title = event.target.innerText || "Notes"; // Use default title if input is empty
// 			noteData.id = id;
// 			noteData.lastModified = getFormattedDate();
// 			notes = notes.filter((note) => note.id !== id); // Remove the old version of the note
// 			notes.push(noteData); // Push the updated version of the note

// 			// Save all notes to local storage
// 			localStorage.setItem("notes", JSON.stringify(notes));
// 		});

// 		const noteText = noteTexts[index];
// 		noteText.innerText = noteData.text || "";

// 		noteText.addEventListener("input", (event) => {
// 			// Save data to the notes array
// 			noteData.text = event.target.innerText;
// 			noteData.id = id;
// 			noteData.lastModified = getFormattedDate();
// 			if (!noteData.title) noteData.title = "Notes"; // Add default title if it's not there
// 			notes = notes.filter((note) => note.id !== id); // Remove the old version of the note
// 			notes.push(noteData); // Push the updated version of the note

// 			// Save all notes to local storage
// 			localStorage.setItem("notes", JSON.stringify(notes));
// 		});
// 	});
// });

// // Retrieve noteTitle and noteText
// const noteTitle = document.querySelector("#noteTitle");
// const noteText = document.querySelector("#noteText");

// // Load all notes from local storage
//

// Fetch the note passed to this window
window.electron.on("note-data", (note, noteId) => {
	const noteTitle = document.querySelector("#noteTitle");
	const noteText = document.querySelector("#noteText");
	let notes = JSON.parse(localStorage.getItem("notes")) || [];
	console.log(note);
	// Display the note
	console.log(note.text);
	console.log(noteId);
	noteTitle.innerHTML = note.title;
	noteText.innerHTML = note.text;

	noteTitle.addEventListener("input", (event) => {
		// Save data to the notes array
		note.title = event.target.innerText || "Notes"; // Use default title if input is empty
		note.id = noteId;
		note.lastModified = getFormattedDate();
		notes = notes.filter((note) => note.id !== noteId); // Remove the old version of the note
		notes.push(note); // Push the updated version of the note

		// Save all notes to local storage
		localStorage.setItem("notes", JSON.stringify(notes));
	});

	noteText.addEventListener("input", (event) => {
		// Save data to the notes array
		note.text = event.target.innerText;
		note.lastModified = getFormattedDate();
		if (!note.title) noteData.title = "Notes"; // Add default title if it's not there
		notes = notes.filter((note) => note.id !== noteId); // Remove the old version of the note

		notes.push(note); // Push the updated version of the note

		// Save all notes to local storage
		localStorage.setItem("notes", JSON.stringify(notes));
	});
});

// Function to get last modification time of a note
function getLastModifiedTime(id) {
	const notes = JSON.parse(localStorage.getItem("notes"));
	const note = notes.find((note) => note.id === id);
	if (note && note.lastModified) {
		return note.lastModified;
	} else {
		return null;
	}
}

// Function to get current date in Month day, year format
function getFormattedDate() {
	const date = new Date();
	const options = { year: "numeric", month: "long", day: "numeric" };
	return date.toLocaleDateString("en-US", options);
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
// Attach an event listener to the new note button
const newNoteButton = document.querySelector(".newNoteButton");
newNoteButton.addEventListener("click", () => {
	console.log("added");
	window.electron.newWindow();
});
