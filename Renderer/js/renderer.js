const draggables = document.querySelectorAll(".card");
const droppables = document.querySelectorAll(".swim-lane");
const form1 = document.getElementById("todo-form1");
const todoLane1 = document.getElementById("todo-lane1");

function saveNotesData() {
	const lanesData = [todoLane1].map((lane) => {
		const cards = Array.from(lane.querySelectorAll(".card-text"));
		return cards.map((card) => card.innerText);
	});

	localStorage.setItem("notesData", JSON.stringify(lanesData));
}

function loadNotesData() {
	const savedData = localStorage.getItem("notesData");

	if (savedData) {
		const lanesData = JSON.parse(savedData);

		[todoLane1].forEach((lane, laneIndex) => {
			lanesData[laneIndex].forEach((cardText) => {
				createNotesCard(lane, cardText, true);
			});
		});
	}
}

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

function createNotesCard(lane, cardText, prepend = false) {
	const newTask = document.createElement("p");
	newTask.classList.add("card");
	newTask.setAttribute("draggable", "true");

	const deleteButtonContainer = document.createElement("div");
	deleteButtonContainer.classList.add("delete-button-container");
	newTask.appendChild(deleteButtonContainer);

	const deleteButton = document.createElement("button");
	deleteButton.classList.add("delete-button");
	deleteButton.innerHTML = `
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
>
    <path
        fill="gray"
        d="M7 12a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Zm7 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"
    />
</svg>
`;
	deleteButtonContainer.appendChild(deleteButton);

	const newParagraph = document.createElement("p");
	newParagraph.classList.add("card-text");
	newParagraph.setAttribute("contenteditable", "true");
	newParagraph.innerText = cardText;
	newTask.appendChild(newParagraph);

	// Add the input event listener to save data while typing
	newParagraph.addEventListener("input", () => {
		saveNotesData();
	});

	deleteButton.addEventListener("click", () => {
		newTask.remove(); // Remove the card from the DOM
		saveNotesData(); // Save the updated data to local storage
	});

	newTask.addEventListener("dragstart", (e) => {
		e.dataTransfer.setDragImage(new Image(), 0, 0);
	});

	if (!prepend) {
		lane.prepend(newTask); // Inserts the new task at the beginning of the lane when loading
	} else {
		lane.appendChild(newTask); // Inserts the new task at the end of the lane when creating a new task
	}
}

function attachSubmitListener(form, todoLane) {
	form.addEventListener("submit", (e) => {
		e.preventDefault();
		createNotesCard(todoLane, " ");
		saveNotesData();
	});
}

attachSubmitListener(form1, todoLane1);

loadNotesData();

toggleLock();

// renderer.js
document.getElementById("noteWindow").addEventListener("click", () => {
	window.electron.newWindow();
});
