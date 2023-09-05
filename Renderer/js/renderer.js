const draggables = document.querySelectorAll(".card");
const droppables = document.querySelectorAll(".swim-lane");
const form1 = document.getElementById("todo-form1");
const todoLane1 = document.getElementById("todo-lane1");
const searchBarInput = document
	.querySelector('input[type="text"]')
	.value.toLowerCase();

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

function updateNotes() {
	// Clear existing note cards
	noteCardsContainer.innerHTML = "";

	// Load all notes from local storage
	const notes = JSON.parse(localStorage.getItem("notes")) || [];

	const colorMap = {
		red: "bg-red-500",
		blue: "bg-blue-500",
		green: "bg-green-500",
		yellow: "bg-yellow-500",
		orange: "bg-orange-500",
		pink: "bg-pink-500",
	};

	// Sort the notes by date
	notes.sort((a, b) => b.lastModified.localeCompare(a.lastModified));

	// Get the search input from the search bar
	const searchBarInput = document
		.querySelector('input[type="text"]')
		.value.toLowerCase();

	// Check if the search input is a color name
	const searchColorClass = colorMap[searchBarInput];

	// Loop over all notes
	for (let i = 0; i < notes.length; i++) {
		const noteData = notes[i];

		// Convert the title and text to lowercase for case insensitive search
		const titleLowerCase = noteData.title.toLowerCase();
		const textLowerCase = noteData.text.toLowerCase();

		// If searching by color and the note's color doesn't match, skip
		if (searchColorClass && noteData.color !== searchColorClass) {
			continue;
		}

		// Check if the note's title or text includes the search input
		// If it does not, skip to the next iteration of the loop
		// If not searching by color, check if the note's title or text includes the search input
		if (
			!searchColorClass &&
			!titleLowerCase.includes(searchBarInput) &&
			!textLowerCase.includes(searchBarInput)
		) {
			continue;
		}

		// Create a new div for the note card
		const noteCard = document.createElement("div");
		noteCard.setAttribute("data-id", noteData.id);
		noteCard.classList.add(
			"card",
			"gap-2",
			"py-5",
			"cursor-pointer",
			"noteWindow",
			"hover:bg-blue-600",
			"hover:scale-[102%]",
			"hover:border-blue-500",
			"group",
			"transition",
			"duration-75",
			"ease-in-out"
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
		if (noteData.color) {
			noteCircle.classList.add(noteData.color, "w-3", "h-3", "rounded-full");
		} else {
			noteCircle.classList.add("bg-green-500", "w-3", "h-3", "rounded-full");
		}

		noteTitle.appendChild(noteCircle);

		// Add the title to header
		const noteTitleText = document.createElement("p");
		noteTitleText.classList.add("overflow-scroll", "whitespace-nowrap");
		// Process the title in the same way as the text
		let processedTitle = noteData.title;
		if (processedTitle.length >= 15) {
			noteTitleText.innerText = processedTitle.substring(0, 13) + "...";
		} else {
			noteTitleText.innerText = processedTitle;
		}

		noteTitle.appendChild(noteTitleText);
		noteHeader.appendChild(noteTitle);

		// Add the date to the header
		const noteDate = document.createElement("p");
		noteDate.classList.add("text-gray-500", "group-hover:text-gray-200");
		noteDate.innerText = formatDate(noteData.lastModified);
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
		noteText.classList.add(
			"card-text",
			"text-gray-500",
			"group-hover:text-gray-200"
		);
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
			const noteId = element.getAttribute("data-id"); // Get the id of the note
			const note = notes.find((note) => note.id === noteId); // Find the note with the matching id

			if (note) {
				// Check if note was found
				console.log(note);
				// Pass the corresponding note data and id to the newWindow function
				window.electron.newWindow(note);
			} else {
				console.log(`Note with id ${noteId} not found.`);
			}
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
	note = {
		id: generateRandomId(),
		title: "Note",
		text: "",
		lastModified: getFormattedDate(),
		color: "bg-green-500",
	};
	window.electron.newWindow(note);
});

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

function generateRandomId() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function formatDate(isoDateString) {
	const date = new Date(isoDateString);
	const options = { year: "numeric", month: "long", day: "numeric" };
	return date.toLocaleDateString("en-US", options);
}
