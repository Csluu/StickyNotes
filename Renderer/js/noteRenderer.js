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
// ! Will have to redo this
// ! The implementation is not as good as it should be I should be passing only the ID from the main menu to the note window then grabbing and loading the information from storage
// ! Passing the note ID and the content makes it harder to implement features on top of
window.electron.on("note-data", (noteID) => {
	// const noteTitle = document.querySelector("#noteTitle");
	// const noteText = document.querySelector("#noteText");
	let notes = JSON.parse(localStorage.getItem("notes")) || [];
	const note = notes.find((n) => n.id === noteID);

	// Using closure to pass the ID into the quitnote function
	document
		.getElementById("noteQuit")
		.addEventListener("click", quitNoteAndCloseWindow(note.id));

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

		saveUpdatedNote(note);
	});

	noteText.addEventListener("input", (event) => {
		// Save data to the notes array
		note.text = event.target.innerText;
		noteId = note.id;
		note.lastModified = getFormattedDate();
		if (!note.title) noteData.title = "Notes"; // Add default title if it's not there
		saveUpdatedNote(note);
	});

	deleteButton.addEventListener("click", () => {
		const notes = JSON.parse(localStorage.getItem("notes")) || [];
		const noteId = note.id; // assuming 'note' is the current note

		// Remove the note with the provided id
		const updatedNotes = notes.filter((note) => note.id !== noteId);

		// Update local storage
		localStorage.setItem("notes", JSON.stringify(updatedNotes));
		window.electron.ipcRenderer.send("remove-note", noteId);
		console.log("Deleted");
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
				saveUpdatedNote(note);
			}
		});
	});

	console.log(note.id);

	function saveUpdatedNote(updatedNote) {
		// * Need to grab the latest note at it could change when having another note open!!!!!!!
		// * for example if this note data was still on index 65 and another was on 70 making changes on index 65 would save the list only up to 65
		const notes = JSON.parse(localStorage.getItem("notes")) || [];
		const noteIndex = notes.findIndex((note) => note.id === updatedNote.id);
		if (noteIndex !== -1) {
			notes[noteIndex] = updatedNote;
		} else {
			// In case the note wasn't found, which shouldn't happen, but just in case:
			notes.push(updatedNote);
		}
		localStorage.setItem("notes", JSON.stringify(notes));
	}

	function toggleTransparent(dropDown, menu, noteID) {
		menu.addEventListener("click", () => {
			dropDown.classList.toggle("opacity-75");

			// Toggle the "always on top" state
			window.electronAPI.toggleAlwaysOnTop(noteID);
			console.log(note.id);
		});
	}

	toggleTransparent(
		document.getElementById("body"),
		document.getElementById("transparent-menu-1"),
		note.id
	);
});
// ! End

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

// Resizing Window
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

	// throttling as it jitters when resizing in the x position
	let throttleTimeout;
	document.addEventListener("mousemove", (e) => {
		if (resizing && !throttleTimeout) {
			throttleTimeout = setTimeout(() => {
				console.log("MouseMove: ", e.clientX, e.clientY);
				window.electronAPI.resizeWindow(e.clientX + 50, e.clientY + 200);
				throttleTimeout = null;
			}, 30); // Throttle time in milliseconds
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
	const lockIcon = document.getElementById("lock-icon");
	const container = document.getElementById("noteBody");
	const lockText = document.getElementById("lock-text");

	const lockedPath =
		"M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z";
	const unlockedPath =
		"M6 8h9V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6H7q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8Zm6 9q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17Z";

	menuLock1.addEventListener("click", () => {
		const currentPath = lockIcon.getAttribute("d");

		if (currentPath === lockedPath) {
			lockIcon.setAttribute("d", unlockedPath);
		} else {
			lockIcon.setAttribute("d", lockedPath);
		}

		// Toggle text for Lock/Unlock
		if (lockText.innerHTML === "Lock") {
			lockText.innerHTML = "Unlock";
		} else {
			lockText.innerHTML = "Lock";
		}

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

["color-drop-down", "menu-1"].forEach((buttonId) => {
	document.getElementById(buttonId).addEventListener("click", function (event) {
		// Assuming the menu IDs are the button IDs without the "show-" prefix.
		const menuId = buttonId.replace("show-", "");
		document.getElementById(menuId).classList.remove("hidden");
		event.stopPropagation();
	});
});

// The function to run whenever a click is detected in the document
function checkForMenuHide(event) {
	// The element that was clicked
	const clickedElement = event.target;

	// An array containing the IDs of all menus you want to manage
	const menuIds = ["color-menu", "drop-down-1"];

	// Loop through each menu ID
	menuIds.forEach((menuId) => {
		// Get the menu element by its ID
		const menu = document.getElementById(menuId);

		// Check if the clicked element is inside the menu or is the menu itself
		const isInsideMenu =
			menu.contains(clickedElement) || menu === clickedElement;

		if (!isInsideMenu) {
			// If the click was outside the menu, hide it
			menu.classList.add("hidden");
		}
	});
}

// Attach the function to the document
document.addEventListener("click", checkForMenuHide);

document.addEventListener("copy", function (e) {
	e.clipboardData.setData("text/plain", window.getSelection().toString());
	e.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
});

// Deleting the note from the open note session and closing the window
function quitNoteAndCloseWindow(noteId) {
	return function () {
		window.electron.quitNote(noteId);
		window.electron.closeWindow();
	};
}
