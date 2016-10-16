$(document).ready(function() {
	$.get("novelList", undefined, data => {
		$("#content").text(JSON.stringify(data));
	}, "json");
});