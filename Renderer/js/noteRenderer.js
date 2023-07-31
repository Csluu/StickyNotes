// Fetch the note passed to this window
window.electron.on("note-data", (note) => {
	if (!note.id) {
		note.id = generateUUID();
	}

	const noteTitle = document.querySelector("#noteTitle");
	const noteText = document.querySelector("#noteText");
	let notes = JSON.parse(localStorage.getItem("notes")) || [];
	console.log(note);
	// Display the note
	console.log(note.text);

	noteTitle.innerHTML = note.title;
	noteText.innerHTML = note.text;

	noteTitle.addEventListener("input", (event) => {
		// Save data to the notes array
		note.title = event.target.innerText || "Notes"; // Use default title if input is empty
		noteId = note.id;
		note.lastModified = getFormattedDate();
		notes = notes.filter((note) => note.id !== noteId); // Remove the old version of the note
		notes.push(note); // Push the updated version of the note

		// Save all notes to local storage
		localStorage.setItem("notes", JSON.stringify(notes));
	});

	noteText.addEventListener("input", (event) => {
		// Save data to the notes array
		note.text = event.target.innerText;
		noteId = note.id;
		note.lastModified = getFormattedDate();
		if (!note.title) noteData.title = "Notes"; // Add default title if it's not there
		notes = notes.filter((note) => note.id !== noteId); // Remove the old version of the note

		notes.push(note); // Push the updated version of the note

		// Save all notes to local storage
		localStorage.setItem("notes", JSON.stringify(notes));
	});
});

// A simple function to generate UUIDs.
function generateUUID() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

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
