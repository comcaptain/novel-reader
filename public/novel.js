function storeNovel(novelId, novel) {
	try {
		localStorage.setItem(novelId, JSON.stringify(novel));
	}
	catch(e) {
		//local storage is full, try again
		localStorage.clear();

		try {
			localStorage.setItem(novelId, JSON.stringify(novel));
		}
		catch(e2) {
			console.error("novel is too large to store in local storage");
		}
	}
}
function loadNovel() {
	return new Promise((resolve, reject) => {
		var novelDataUrl = window.location.href.match(/\?path=(.*)/)[1];
		var novel = JSON.parse(localStorage.getItem(novelDataUrl));
		if (novel) {
			resolve(novel);
			return;
		}
		var xhr = new XMLHttpRequest();
		xhr.open("GET", novelDataUrl, true);
		xhr.responseType = "json";
		xhr.onload = function(e) {
			novel = this.response;
			novel.id = novelDataUrl;
			storeNovel(novelDataUrl, novel);
			resolve(novel);
		}
		xhr.send();
	})
}
function renderChapter(novel, index) {
	var template = document.getElementById("chapter-template");
	var clone = document.importNode(template.content, true);
	var chapter = novel.chapters[index];
	clone.querySelector(".chapter-title").textContent = chapter.name;
	clone.querySelector(".body").textContent = chapter.content;
	clone.querySelector(".chapter-info").textContent = `字数:${chapter.content.length}`;
	clone.children[0].id = generateChapterId(index);
	return clone;
}
function renderCategory(novel) {
	var container = document.getElementById("category-items");
	for (var i = 0; i < getChapterCount(novel); i++) {
		var li = document.createElement("li");
		li.classList.add("chapter-name");
		li.textContent = novel.chapters[i].name;
		li.dataset.chapterIndex = i;
		container.appendChild(li);
	}
}
function getChapterCount(novel) {
	return novel.chapters.length;
}
//return 0 if it's current chapter
//return -1 if chapterIndex is lower than current chapter's index
//return 1 if chapterIndex is higher than current chapter's index
function visibilityStatus(chapterIndex) {
	var chapterElement = document.getElementById(generateChapterId(chapterIndex));
	var scrollTop = window.scrollY;
	var chapterTop = chapterElement.offsetTop;
	var chapterHeight = chapterElement.offsetHeight;
	//case 1, chapter occupies the whole viewport
	//case 2, this chapter is going to end, next chapter's title appears in the viewport
	if (chapterTop <= scrollTop && (chapterTop + chapterHeight) > scrollTop) return 0;
	if (chapterTop + chapterHeight <= scrollTop) return -1;
	return 1;
}
function isCurrentChapter(chapterIndex) {
	return visibilityStatus(chapterIndex) === 0;
}
function generateChapterId(index) {
	return "chapter" + (parseInt(index) + 1);
}
function getCurrentChapterIndex(novel) {
	var startIndex = 0;
	var endIndex = getChapterCount(novel) - 1;
	if (isCurrentChapter(startIndex)) return startIndex;
	if (isCurrentChapter(endIndex)) return endIndex;
	while(startIndex != endIndex) {
		var middle = Math.round((startIndex + endIndex) / 2);
		var compareToCurrentChapter = visibilityStatus(middle);
		if (compareToCurrentChapter == 0) return middle;
		//in case infinite loop happens
		if (middle == startIndex || middle == endIndex) break;
		if (compareToCurrentChapter < 0) startIndex = middle;
		else endIndex = middle;
	}
	throw "Something wrong happens, current chapter is not found";
}
// return
// {
// 	index: index,
// 	relativeScrollTop: xxx 
// }
// index: index of current chapter
// relativeScrollTop is the scroll pixels relative to current chapter's top
function getCurrentReadLocation(novel) {
	var chapterIndex = getCurrentChapterIndex(novel);
	var chapterElement = document.getElementById(generateChapterId(chapterIndex));
	var scrollTop = window.scrollY;
	var chapterTop = chapterElement.offsetTop;
	var chapterRelativeScrollTop = scrollTop - chapterTop;
	return {
		index: chapterIndex,
		relativeScrollTop: chapterRelativeScrollTop
	}
}
function saveCurrentReadLocation(novel) {
	localStorage.setItem(novel.id + "-readlocation", JSON.stringify(getCurrentReadLocation(novel)));
}
function loadCurrentReadLocation(novel) {
	var location = JSON.parse(localStorage.getItem(novel.id + "-readlocation"));
	if (!location) return;
	goToChapter(location.index, location.relativeScrollTop);

}
function goToChapter(chapterIndex, relativeScrollTop) {
	relativeScrollTop = relativeScrollTop ? relativeScrollTop : 0;
	var scrollTop = document.getElementById(generateChapterId(chapterIndex)).offsetTop + relativeScrollTop;
	window.scrollTo(0, scrollTop);
}
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
window.onload = function() {
	if (!window.novel) return;
	loadCurrentReadLocation(novel);
	window.onscroll = function() {
		saveCurrentReadLocation(novel);
	}
}
function getComputedHeight(element) {
	return parseInt(window.getComputedStyle(element).getPropertyValue("height"));
}
document.addEventListener("DOMContentLoaded", function() {
	loadNovel().then(novel => {
		window.novel = novel;
		document.title = novel.name;
		renderCategory(novel);
		var container = document.getElementById("content");
		for (var i = 0; i < getChapterCount(novel); i++) {
			container.appendChild(renderChapter(novel, i));
		}
	});
	document.querySelector("#menuButton").addEventListener("click", function() {
		var category = document.getElementById("category");
		category.classList.toggle("active");
		if (category.classList.contains("active")) {
			[].forEach.call(document.querySelectorAll(".chapter-name"), function(e) {
				e.classList.remove("current");
			});
			var chapterNameElement = document.querySelector(".chapter-name:nth-child(" + (getCurrentChapterIndex(novel) + 1) + ")");
			chapterNameElement.classList.add("current");
			if (!isElementInViewport(chapterNameElement)) {
				chapterNameElement.scrollIntoView();
				chapterNameElement.parentNode.scrollTop -= getComputedHeight(chapterNameElement.parentNode) / 2;
			} 
		}
	});
	document.addEventListener("click", function(event) {
		var target = event.target;
		var categoryContainer = document.getElementById("category");
		if (categoryContainer.contains(target) || categoryContainer === target) {
			return;
		}
		document.getElementById("category").classList.remove("active");
	})
	document.querySelector("#category-dialog").addEventListener("click", function(event) {
		var element = event.target;
		if (!element.classList.contains("chapter-name")) return;
		goToChapter(element.dataset.chapterIndex);
		document.getElementById("category").classList.remove("active");
	});
});