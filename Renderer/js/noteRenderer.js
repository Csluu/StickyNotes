const deleteButton = document.querySelector("#deleteButton");

// Fetch the note passed to this window
window.electron.on("note-data", (note) => {
	const noteTitle = document.querySelector("#noteTitle");
	const noteText = document.querySelector("#noteText");
	let notes = JSON.parse(localStorage.getItem("notes")) || [];
	console.log(note);
	// Display the note
	console.log(note.text);

	noteTitle.innerHTML = note.title;
	noteText.innerHTML = note.text.replace(/\n/g, "<br>");

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

	deleteButton.addEventListener("click", () => {
		const notes = JSON.parse(localStorage.getItem("notes")) || [];
		const noteId = note.id; // assuming 'note' is the current note

		// Remove the note with the provided id
		const updatedNotes = notes.filter((note) => note.id !== noteId);

		// Update local storage
		localStorage.setItem("notes", JSON.stringify(updatedNotes));

		// You may also want to close the window or navigate away after deleting the note
		window.electron.closeWindow();
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

function generateRandomId() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// Function to get current date in Year/Month/Day format
function getFormattedDate() {
	const date = new Date();
	const year = date.getFullYear();
	let month = date.getMonth() + 1; // Months are zero-based
	let day = date.getDate();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();

	// Pad month, day, hours, minutes and seconds with leading zeros if necessary
	month = month < 10 ? "0" + month : month;
	day = day < 10 ? "0" + day : day;
	hours = hours < 10 ? "0" + hours : hours;
	minutes = minutes < 10 ? "0" + minutes : minutes;
	seconds = seconds < 10 ? "0" + seconds : seconds;

	return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
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

toggleDropDown(
	document.getElementById("color-menu"),
	document.getElementById("color-drop-down")
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
	note = {
		id: generateRandomId(),
		title: "Note",
		text: "",
		lastModified: getFormattedDate(),
	};
	window.electron.newWindow(note);
});
