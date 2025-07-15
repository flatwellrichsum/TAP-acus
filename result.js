window.Global = window.Global || {};

let justFinished = false;

function gotoMenuOrCalendar()
{
	if(!justFinished)
	{
		switchToScreen("menu-screen");
	}
	else
	{
		switchToScreen("calendar-screen");

		setTimeout(() => {
			updateCalendar();
		}, 400);
	}
}

function setupResult()
{
	document.querySelector(".result-backButton").addEventListener("click", () => 
	{
		gotoMenuOrCalendar();
	});
}

function shootConfetti() 
{
	const conf = document.createElement("img");
	conf.id = "confetti";
	document.body.appendChild(conf);

	const now = Date.now();
	conf.src = "img/result/confetti.gif?${now}";

	setTimeout(() => {
		conf.remove();
	}, 4000);
}

function hideConfetti() 
{
	const gif = document.getElementById("fullscreen-gif");
	if (gif) gif.style.display = "none";
}

function judgeResult(border)
{
	const total = Global.correctCount + Global.wrongCount;
	const accuracy = total > 0 ? Global.correctCount / total : 0;
	
	let state;
	
	if (Global.correctCount >= border && Global.wrongCount === 0) {
		state = 1; //Perfect
	} else if (correctCount < border) {
		state = -1; // Failure1 
	} else if (accuracy < 0.8 - 0.001) {
		state = -2; // Failure2 
	} else {
		state = 0; // Clear
	}	

	const key = `${Global.mode}-${Global.category}`;

	let currentStatus = getCurrentStatus();
	level = currentStatus[key]["Lv"];
	hearts = currentStatus[key]["hearts"];

	if(state >= 0)
	{
		let menuVisibility = JSON.parse(localStorage.getItem("menuVisibility"));
		menuVisibility[key] = false;
		localStorage.setItem("menuVisibility", JSON.stringify(menuVisibility));
		
		const allFalse = Object.values(menuVisibility).every(v => v === false);
		if(allFalse) {
			for(let k in menuVisibility) {
				menuVisibility[k] = true;
			}
			localStorage.setItem("menuVisibility", JSON.stringify(menuVisibility));

			let finishedCount = JSON.parse(localStorage.getItem("finishedCount"));

			const today = new Date();
			const yyyy = today.getFullYear().toString();
			const mm = (today.getMonth() + 1).toString().padStart(2, "0");
			const dd = today.getDate().toString().padStart(2, "0");
			const todayKey = yyyy + mm + dd;

			if (!(todayKey in finishedCount)) {
				finishedCount[todayKey] = [0,2];
			}

			finishedCount[todayKey][0]++;

			localStorage.setItem("finishedCount", JSON.stringify(finishedCount));
			
			justFinished = true;
		}
		
		hearts += state == 0 ? 1 : 2;
		
		if(hearts > 4)
		{
			hearts = 2;
			level++;
		}
	}
	else
	{
		if(!(level==1 && hearts==0))
		{
			hearts--;
			if(hearts	< 0)
			{
				hearts = 2;
				level--;
			}
		}
	}
	currentStatus[key]["Lv"] = level;
	currentStatus[key]["hearts"] = hearts;
	localStorage.setItem("currentStatus", JSON.stringify(currentStatus));		
	
	return state;
}

function showResult(border)
{
	document.getElementById("result-correct-num").textContent = Global.correctCount;
	document.getElementById("result-wrong-num").textContent = Global.wrongCount;

	const correct = document.getElementById("result-correct-num");
	const wrong = document.getElementById("result-wrong-num");
	const text = document.querySelector(".result-text");
	const reaction = document.querySelector(".result-reaction");
	const button = document.querySelector(".result-backButton");

	correct.classList.remove("animate");
	wrong.classList.remove("animate");
	text.classList.remove("pop-out");
	text.classList.remove("fade-in");
	reaction.src = "img/reaction/wonder.gif";
	button.style.display="none";	

	const state = judgeResult(border);

	setTimeout(() => {
		AudioPlayer.playSound("decision41");
		correct.classList.add("animate");
	}, 1000);

	setTimeout(() => {
		AudioPlayer.playSound("decision41");
		wrong.classList.add("animate");
	}, 2000);

	setTimeout(() => {
		switch (state) {
			case -2:
				reaction.src = "img/reaction/down.gif";
				text.src = "img/result/failure_1.png";
				text.classList.add("fade-in");
				
				AudioPlayer.playSound("chan-chan1");
				setTimeout(() => {
					AudioPlayer.playSound("girl1-zannen1");
				}, 1000);
				break;

			case -1:
				reaction.src = "img/reaction/down.gif";
				text.src = "img/result/failure_0.png";
				text.classList.add("fade-in");
				
				AudioPlayer.playSound("chan-chan1");
				setTimeout(() => {
					AudioPlayer.playSound("girl1-zannen1");
				}, 1000);
				break;

			case 0:
				reaction.src = "img/reaction/smile.gif";
				text.src = "img/result/clear.png";
				AudioPlayer.playSound("people-performance-cheer2");
				text.classList.add("pop-out");

				AudioPlayer.playSound("kira1");
				AudioPlayer.playSound("people-performance-cheer2");
				AudioPlayer.playSound("girl1-oo1");
				setTimeout(() => {
					AudioPlayer.playSound("girl1-yattane1");
				}, 2000);

				break;

			case 1:
				reaction.src = "img/reaction/glad.gif";
				text.src = "img/result/perfect.png";
				shootConfetti();
				text.classList.add("pop-out");

				AudioPlayer.playSound("cute-pose1");
				AudioPlayer.playSound("people-performance-cheer1");
				AudioPlayer.playSound("girl1-uwaa1");
				setTimeout(() => {
					AudioPlayer.playSound("girl1-sugoisugoi1");
				}, 2000);	

				setTimeout(() => {
					AudioPlayer.playSound("girl1-ufufu1");
				}, 4000);

				break;
			default:
				break;
		}	
	}, 3000);
	
	setTimeout(() => {
		button.style.display = "block";
	}, 6000);

	Global.timeoutList.push(setTimeout(() => {
		gotoMenuOrCalendar();
	}, 16000));
}