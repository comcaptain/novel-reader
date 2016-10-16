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
	});
	dropArea.addEventListener("drop", event => {
		event.preventDefault();
		dropArea.classList.remove("dragover");
		processUploadedFiles(event.dataTransfer.files);
	})
}

/**
 * @param files: FileList
 */
function processUploadedFiles(fileList) {
	var files = toList(fileList);
	if (!confirm(`Are you sure to upload below files?\n\n ${files.map(f => f.name.trim()).join("\n")}`)) return;
	var fileReaders = files.map(file => new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.onload = e => {
			resolve({name: file.name, content: e.target.result});
		};
		reader.readAsText(file);
	}));
	Promise.all(fileReaders).then(contents => {
		var displayStr = contents.map(f => f.name + "\n\n" + f.content)
			.join("\n\n---------------------------------------------------------------------------------\n\n");
		id("content").textContent = displayStr;
	});
}

