// Grab the main button element
const dropDownButton = document.getElementById("color-drop-down");
const deleteButton = document.querySelector("#deleteButton");
// Define all the possible color classes
const colorClasses = [
	"bg-blue-500",
	"bg-red-500",
	"bg-green-500",
	"bg-yellow-500",
	"bg-orange-500",
	"bg-pink-500",
];

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

	// Apply color to the button based on note.color
	if (note.color) {
		dropDownButton.classList.remove(...colorClasses); // Remove any existing color classes
		dropDownButton.classList.add(note.color); // Add the color from note.color
	}

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

	// Add event listeners to each color button
	document.querySelectorAll(".color-btn").forEach((btn) => {
		btn.addEventListener("click", function () {
			// Remove existing color classes from the main button
			dropDownButton.classList.remove(...colorClasses);

			// Get the color class from the pressed button
			const newColor = Array.from(btn.classList).find((cls) =>
				colorClasses.includes(cls)
			);

			// Add the color class to the main button
			if (newColor) {
				dropDownButton.classList.add(newColor);

				// Update the note object with the selected color
				note.color = newColor;

				// Update local storage with the new color
				let noteId = note.id;
				note.lastModified = getFormattedDate();
				notes = notes.filter((noteItem) => noteItem.id !== noteId); // Remove the old version of the note
				notes.push(note); // Push the updated version of the note
				localStorage.setItem("notes", JSON.stringify(notes));
			}
		});
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
	const container = document.getElementById("noteBody");

	menuLock1.addEventListener("click", () => {
		container.classList.toggle("yes-drag");
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
