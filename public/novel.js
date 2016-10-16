var CHAPTER_REGEX = /[第（][一二三四五六七八九零十百千万]+[）章][^\n]*/g;
function parseNovel(content) {
	var firstLineTo = content.indexOf("\n");
	var novelName = content.substring(0, firstLineTo).trim();
	var secondLineTo = content.indexOf("\n", firstLineTo + 1);
	var author = content.substring(firstLineTo + 1, secondLineTo).trim();
	content = content.substring(secondLineTo);
	var chapterNames = content.match(CHAPTER_REGEX);
	var chapterTexts = content.split(CHAPTER_REGEX);
	chapterTexts.splice(0, 1);
	var chapters = [];
	for (var i = 0, j = 0; i < chapterNames.length; i++) {
		if (chapterTexts[i] == undefined || chapterTexts[i].length < 300) continue;
		chapters[j++] = {name: chapterNames[i], content: chapterTexts[i].replace(/^[\s\n]*/m, "    ")};
	}
	return {
		name: novelName,
		author: author,
		chapters: chapters
	};
}