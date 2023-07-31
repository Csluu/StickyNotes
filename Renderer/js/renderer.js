const draggables = document.querySelectorAll(".card");
const droppables = document.querySelectorAll(".swim-lane");
const form1 = document.getElementById("todo-form1");
const todoLane1 = document.getElementById("todo-lane1");

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

function updateNotes() {
	// Clear existing note cards
	noteCardsContainer.innerHTML = "";

	// Load all notes from local storage
	const notes = JSON.parse(localStorage.getItem("notes")) || [];

	// Loop over all notes
	for (let i = 0; i < notes.length; i++) {
		const noteData = notes[i];

		// Create a new div for the note card
		const noteCard = document.createElement("div");
		noteCard.setAttribute("data-id", i);
		console.log(i);
		noteCard.classList.add(
			"card",
			"gap-2",
			"py-5",
			"cursor-pointer",
			"noteWindow"
		);

		// Set data-id attribute to the note's index

		// 	// adding the delete Button to the top of the noteCard
		// 	const deleteButtonContainer = document.createElement("div");
		// 	deleteButtonContainer.classList.add("delete-button-container");
		// 	noteCard.appendChild(deleteButtonContainer);

		// 	const deleteButton = document.createElement("button");
		// 	deleteButton.classList.add("delete-button");
		// 	deleteButton.innerHTML = `
		// 	<svg
		// 	xmlns="http://www.w3.org/2000/svg"
		// 	width="16"
		// 	height="16"
		// 	viewBox="0 0 16 16"
		// 	version="1.1"
		// 	fill="#ff0000"
		// >
		// 	<path
		// 		style="fill: gray"
		// 		d="M 5,4 C 4.4477,4 4,4.4477 4,5 4,5.2652 4.1055,5.5195 4.293,5.707 L 10.293,11.707 C 10.48,11.895 10.735,12 11,12 11.552,12 12,11.552 12,11 12,10.735 11.895,10.48 11.707,10.293 L 5.707,4.293 C 5.5195,4.1055 5.2652,4 5,4 Z"
		// 	/>
		// 	<path
		// 		style="fill: gray"
		// 		d="M 5,12 C 4.4477,12 4,11.552 4,11 4,10.735 4.1055,10.48 4.293,10.293 L 10.293,4.293 C 10.48,4.105 10.735,4 11,4 11.552,4 12,4.448 12,5 12,5.265 11.895,5.52 11.707,5.707 L 5.707,11.707 C 5.5195,11.895 5.2652,12 5,12 Z"
		// 	/>
		// </svg>
		// `;
		// 	deleteButtonContainer.appendChild(deleteButton);

		// Creating the top container for note title and last modified
		const noteHeader = document.createElement("header");
		noteHeader.classList.add(
			"flex",
			"flex-row",
			"justify-between",
			"card-text"
		);

		const noteTitle = document.createElement("h2");
		noteTitle.classList.add(
			"w-fit",
			"flex",
			"flex-row",
			"gap-2",
			"place-items-center"
		);

		const noteCircle = document.createElement("span");
		noteCircle.classList.add("bg-pink-500", "w-3", "h-3", "rounded-full");
		noteTitle.appendChild(noteCircle);

		// Add the title to header
		const noteTitleText = document.createElement("p");
		noteTitleText.innerText = noteData.title;
		noteTitle.appendChild(noteTitleText);

		noteHeader.appendChild(noteTitle);

		// Add the date to the header
		const noteDate = document.createElement("p");
		noteDate.classList.add("text-gray-500");
		noteDate.innerText = noteData.lastModified;
		noteHeader.appendChild(noteDate);

		// adding the header (title and date) to the noteCard
		noteCard.appendChild(noteHeader);

		// Add some text to the note card
		const noteText = document.createElement("p");
		// Show only first 25 characters or less
		// Show only the plain text, ignoring all new lines \n. G means global so it will replace all occurrences not just the first one
		let processedText = noteData.text.replace(/\n/g, " ");

		if (processedText.length >= 25) {
			noteText.innerText = processedText.substring(0, 25) + "...";
		} else {
			noteText.innerText = processedText;
		}
		noteText.classList.add("card-text", "text-gray-500");
		noteCard.appendChild(noteText);

		// Append the note card to the container
		noteCardsContainer.appendChild(noteCard);
	}
	return notes;
}

function bindEventListeners(notes) {
	// Attach event listeners to note cards
	document.querySelectorAll(".noteWindow").forEach((element) => {
		// Remove any existing event listeners first
		element.removeEventListener("click", openNoteWindow);
		// Attach event listener
		element.addEventListener("click", openNoteWindow);

		function openNoteWindow() {
			const noteId = parseInt(element.getAttribute("data-id")); // Get the id of the note
			const note = notes[noteId];
			// Pass the corresponding note data and id to the newWindow function
			window.electron.newWindow(note, noteId);
		}
	});
}

window.addEventListener("DOMContentLoaded", () => {
	const notes = updateNotes();
	bindEventListeners(notes);

	// Update notes every 5 seconds
	setInterval(() => {
		const newNotes = updateNotes();
		bindEventListeners(newNotes);
	}, 5000);
});

// Attach an event listener to the new note button
const newNoteButton = document.querySelector(".newNoteButton");
newNoteButton.addEventListener("click", () => {
	console.log("added");
	window.electron.newWindow();
});
