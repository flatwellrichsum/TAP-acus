window.Global = window.Global || {};

function arrangeMenuButtons() {

	let currentStatus = getCurrentStatus();

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 4; j++) {
			const btn = document.getElementById(`menuBtn_${j}-${i}`);
			if (!btn) continue;

			btn.innerHTML = "";

			const levelIndex = currentStatus[`${j}-${i}`].Lv;
			const heartsIndex = currentStatus[`${j}-${i}`].hearts;

			const images = [
				{ class: 'base',	 src: `img/menu/base_${j}-${i}.png` },
				{ class: 'hearts', src: `img/menu/hearts_${heartsIndex}.png` },
				{ class: 'level',	src: `img/menu/level_${levelIndex}.png` },
			];

			for (const imgData of images) {
				const img = document.createElement('img');
				img.className = imgData.class;
				img.src = imgData.src;
				btn.appendChild(img);
			}
		}
	}
}

function setMenuButtonLink(){

	document.querySelectorAll(".menuButton").forEach(btn => {

		btn.addEventListener("click", () => {

			const target = event.currentTarget;
			Global.mode = parseInt(target.dataset.mode, 10);
			Global.category = parseInt(target.dataset.category, 10);

			playSound("enter");
			
			switchToScreen("abacus-screen");
			startAbacus();
		});
	});
}

function changeMenuReaction() {

	const img = document.getElementById("menu-reaction");
	img.src = "img/reaction/wonder.gif";
	
	Global.timeoutList = [];
	Global.intervalList = [];

	Global.timeoutList.push(setTimeout(() => {
		AudioPlayer.playSound("girl1-n1");
	}, 10000));

	Global.timeoutList.push(setTimeout(() => {
		AudioPlayer.playSound("girl1-nn1");
	}, 15000));

	Global.timeoutList.push(setTimeout(() => {
		AudioPlayer.playSound("girl1-uu2");
		img.src = "img/reaction/cry.gif";

		const soundSequence = [
		  "girl1-gusuhikkuhikku1",
		  "girl1-ueeen1",
		  "girl1-gusuhikkuhikku1",
		  "girl1-uwaan1"
		];
		
		let i = 0;
		Global.intervalList.push(setInterval(() => {
			const soundName = soundSequence[i];
			AudioPlayer.playSound(soundName);
			i = (i + 1) % soundSequence.length;
		}, 5000));

	}, 20000));

}

function updateMenu() {

	arrangeMenuButtons();

	const keyList = [
	  "0-0", "1-0", "2-0", "3-0",
	  "0-1", "1-1", "2-1",
	  "0-2", "2-2"];

	let menuVisibility = JSON.parse(localStorage.getItem("menuVisibility"));

	if (!menuVisibility) {
	  menuVisibility = {};

	  keyList.forEach(key => {
	    menuVisibility[key] = true;
	  });
	  localStorage.setItem("menuVisibility", JSON.stringify(menuVisibility));
	}

	document.querySelectorAll(".menuButton").forEach(btn => {
		const mode = btn.dataset.mode;
		const category = btn.dataset.category;
		const key = `${mode}-${category}`;

//		btn.style.visibility = menuVisibility[key] ? "visible" : "hidden";
		btn.style.opacity = menuVisibility[key] ? 1.0 : 0.2;
	
	});
}

function setupMenu()
{
	arrangeMenuButtons();
	setMenuButtonLink();
}