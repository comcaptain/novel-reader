$(document).ready(function() {
	$.get("novelList", undefined, renderIndex, "json");
});

function renderIndex(data) {
	data.map(dataUrl => {
		var novelName = dataUrl.match(/.*\/(.*)\.json/)[1];
		var a = document.createElement("a");
		a.classList.add("novel");
		a.href = "novel?path=" + dataUrl;
		a.textContent = novelName;
		return a;
	}).forEach(a => {
		id("content").appendChild(a);
	});
}