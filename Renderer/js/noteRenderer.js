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
			window.electronAPI.resizeWindow(e.clientX + 50, e.clientY +50);
		}
	});

	document.addEventListener("mouseup", (e) => {
		resizing = false;
		console.log("MouseUp: ", resizing);
	});
};
