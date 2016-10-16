//TODO: should support drap and drop multiple files
$(document).ready(function() {
	initializeDropArea(document.getElementById("content"));
});

function initializeDropArea(dropArea) {
	dropArea.addEventListener("dragover", event => {
		//since by default, all dom nodes are not valid drag target
		event.preventDefault();
		dropArea.classList.add("dragover")
	});
	dropArea.addEventListener("dragleave", event => {
		dropArea.classList.remove("dragover");
	})
}