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
	// if (!confirm(`Are you sure to upload below files?\n\n${files.map(f => f.name.trim()).join("\n")}`)) return;
	var fileReaders = files.map(file => new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.onload = e => {
			resolve({name: file.name, content: e.target.result});
		};
		reader.readAsText(file, "GB2312");
	}));
	Promise.all(fileReaders).then(contents => {
		var novelFiles = contents.map(parseNovel);
		$.ajax({
			url: "/upload",
			data: JSON.stringify(novelFiles),
			contentType: "application/json; charset=utf-8",
			method: "post",
			success: data => {
				alert(data);
				window.location.reload();
			}

		});
	});
}

const CHAPTER_REGEX = /第[一二三四五六七八九零十百千万0-9]+章[^\n]*/g;
/**
 * @param novelFile: {name: "novel name", content: "novel content"}
 *
 * @return parsed novel
 */
function parseNovel(novelFile) {
	var content = novelFile.content;
	content = content.replace(/\r/g, "");
	var chapterNames = content.match(CHAPTER_REGEX);
	var chapterTexts = content.split(CHAPTER_REGEX);
	chapterTexts.splice(0, 1);
	var chapters = [];
	for (var i = 0, j = 0; i < chapterNames.length; i++) {
		chapters[j++] = {name: chapterNames[i], content: chapterTexts[i].replace(/^[\s\n]*/m, "    ")};
	}
	return {
		name: novelFile.name.replace(/\..*$/, "") ,
		chapters: chapters
	};
}
