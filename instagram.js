// Instagram.com -> Save images from user saved tab(https://www.instagram.com/user_profile/saved/) to local machine in default browser saved folder.
// Remove images from instagram saved page of user after saved to local machine.
// Skip video but saved video links to localStorage.

const selectorImg = ".FFVAD";
const selectorElement = ".v1Nh3.kIKUG._bz0w";
const selectorDialog = ".RnEpo._Yhr4";
const selectorDialogButtonClose = ".wpO6b";
const selectorDialogButtonSave =
	"body > div.RnEpo._Yhr4 > div.pbNvD.QZZGH.bW6vo > div > article > div > div.HP0qD > div > div > div.eo2As > section.ltpMr.Slqrh > span.wmtNn > div > div > button";
const pageDown = 798; // px on y axis
const store = {
	images: "images",
	videos: "videos",
};
let counter = 0;
let imgUrls = [];
let allElements = [];
let videoUrls = [];
let previusWindowOffset = 0;

const getSaved = (key) => JSON.parse(localStorage.getItem(key));
const setSaved = (key, value) =>
	localStorage.setItem(key, JSON.stringify(value));
const scrollToDown = () => window.scrollTo(0, window.pageYOffset + pageDown);
const removedFromSaved = () =>
	document.querySelector(selectorDialogButtonSave)?.click();

// Snippet add .save method to global object "console" for save text to file
(function (console) {
	console.save = function (data, filename) {
		if (!data) return console.error("Console.save: No data");

		if (!filename) filename = "console.json";

		if (typeof data === "object") data = JSON.stringify(data, undefined, 4);

		const blob = new Blob([data], { type: "text/json" }),
			a = document.createElement("a");

		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
		a.click();
	};
})(console);

const saveToFile = (data, filename) => console.save(data, filename);
const saveVideoLinksToFile = () =>
	saveToFile(JSON.stringify(getSaved(store.videos)), "video_links.json");

async function downloadImage(imageSrc, imageName) {
	const image = await fetch(imageSrc);
	const imageBlog = await image.blob();
	const imageURL = URL.createObjectURL(imageBlog);
	const link = document.createElement("a");
	link.href = imageURL;
	link.download = Date.now().toString();
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const getImgUrl = (item) => {
	function handler() {
		item.getElementsByTagName("a")[0].click();

		const dialogHandler = () => {
			const dialog = document.querySelector(selectorDialog);
			const imgSrc = dialog.querySelector(selectorImg)?.src;
			if (imgSrc) {
				imgUrls.push(imgSrc);
				downloadImage(imgSrc);
				removedFromSaved();
				console.log(imgSrc);
			} else {
				const videoUrl = item.getElementsByTagName("a")[0]?.href;
				if (videoUrl) {
					videoUrls.push(videoUrl);
					setSaved(store.videos, videoUrls);
                    removedFromSaved();
				}
			}
			const el = dialog.querySelector(selectorDialogButtonClose);
			el && el.click();
		};

		setTimeout(dialogHandler, 3000);
	}

	setTimeout(handler, (counter += 4000));
};

const scrollHandler = () => {
	if (window.pageYOffset > previusWindowOffset + 600) {
		console.clear();
		console.error("STOP!");
		previusWindowOffset = window.pageYOffset;

		const tempArr = [...document.querySelectorAll(selectorElement)];
		const result = tempArr.filter((item) => {
			return !allElements.includes(item);
		});
		result.forEach((item) => allElements.push(item));
		result.forEach(getImgUrl);
		setTimeout(scrollToDown, (counter += 5000));
		counter = 0;
	}
};

const removeEvent = () => document.removeEventListener("scroll", scrollHandler);

document.addEventListener("scroll", scrollHandler);
scrollToDown();

