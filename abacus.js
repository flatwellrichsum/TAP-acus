window.Global = window.Global || {};

const columns = 4;
const rows = 5;

let states = Array.from({ length: columns }, () => Array(rows).fill(false));
let isKeypadMode = false;
let running = false;
let keypadInput = "";
let sum = 0;
let currentQuestion = "";
let currentAnswer = 0;
let correctCount = 0;
let wrongCount = 0;

let spec;

const quiz = document.getElementById("quiz");
const quizContainer = document.getElementById("quiz-container");
const boardContainer = document.getElementById("board-container");
const beadsContainer = document.getElementById("beads-container");
const keypadContainer = document.getElementById("keypad-container");

const upperBeads = document.getElementById("upperBeads");
const lowerBeads = document.getElementById("lowerBeads");
const separator = document.querySelector(".separator");

const resetBtn = document.getElementById("reset");
const checkBtn = document.getElementById("check");

function endingAbacus()
{
	if(!running)
	{
		Global.correctCount = correctCount;
		Global.wrongCount = wrongCount;

		boardContainer.style.display = "none";

		setTimeout(() => {
			AudioPlayer.playSound("police-whistle2");
		}, 500);	

		setTimeout(() => {
			AudioPlayer.playSound("girl1-sokomade1");
		}, 1500);	

		setTimeout(() => {
			switchToScreen("result-screen");
			showResult(border = spec["border"]);
		}, 3000);	
	}
}

function gauge_getHueColor(percentage) {
	const hue = percentage * 240; // green->red
	return `hsl(${hue}, 80%, 80%)`;
}

function gauge_drawGauge(percentage)
{
	const canvas = document.getElementById("gauge");
	const ctx = canvas.getContext('2d');

	const gaugeWidth = canvas.width;
	const gaugeHeight = canvas.height;

	ctx.clearRect(0, 0, gaugeWidth, gaugeHeight);
	const fillWidth = gaugeWidth * (1-percentage);
	ctx.fillStyle = gauge_getHueColor(percentage);
	ctx.fillRect(0, 0, fillWidth, gaugeHeight);
}

function runGauge() {

	const totalTime = spec["duration"] * 1000;

	const startTime = Date.now();

	function update() {
		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, totalTime - elapsed);
		const percentage = remaining / totalTime;

		gauge_drawGauge(percentage);
		
		if (remaining > 0) {
			running = true;
			requestAnimationFrame(update);
		} else {
			running = false;
			gauge_drawGauge(0);
		}
	}

	update();
}

function updateSum() {
	sum = states.reduce((acc, colStates, col) => {
		let N = colStates.slice(1).filter(Boolean).length;
		if (colStates[0]) N += 5;
		return acc + N * Math.pow(10, columns - col - 1);
	}, 0);
}

function handleSound(col, row, stateOn) {
	const note = row === 0 ? "G" : ["C", "D", "E", "F"][row - 1];
	AudioPlayer.playSound(`${stateOn ? "on" : "off"}${note}`);
}

function toggleButton(col, row) {
	if (isKeypadMode && Global.category !== 2) return;

	const current = states[col][row];
	handleSound(col, row, !current);

	if (!current) {
		if (row === 0) {
			states[col][0] = true;
		} else {
			for (let i = 1; i <= row; i++) states[col][i] = true;
		}
	} else {
		if (row === 0) {
			states[col][0] = false;
		} else {
			for (let i = row; i < rows; i++) states[col][i] = false;
		}
	}

	if (Global.mode === 1) {
		const img = document.getElementById(`button-${col}-${row}`);
		if (img) {
			img.src = "img/beads/hidden_on.png";
			setTimeout(() => {
				img.src = "img/beads/hidden_off.png";
			}, 50);
		}
	} else {
		updateImages();
	}
	updateSum();
	
}

function updateImages() {
	states.forEach((colStates, col) => {
		let count = colStates.slice(1).filter(Boolean).length;
		if (colStates[0]) count += 5;
		const imageSuffix = count.toString().padStart(2, "0");

		colStates.forEach((state, row) => {
			const img = document.getElementById(`button-${col}-${row}`);
			
			if (!img) return; 
			
			if (Global.mode===1){
					img.src = "img/beads/hidden_off.png";
				}
			else{
				img.src = state ? `img/beads/main_on_${imageSuffix}.png` : "img/beads/main_off.png";
			}
			
		});
	});
}

function createColumn(col, rows, parent, startRow = 0) {
	const column = document.createElement("div");
	column.className = "column";
	for (let row = startRow; row < rows; row++) {
		createButton(col, row, column);
	}
	parent.appendChild(column);
}


function createButton(col, row, parent) {
	const container = document.createElement("div");
	container.className = "button-container";

	const img = document.createElement("img");
	img.src = Global.mode === 1 ? "img/beads/hidden_off.png" : "img/beads/main_off.png";
	img.id = `button-${col}-${row}`;

	const overlay = document.createElement("div");
	const handler = () => toggleButton(col, row);
	overlay.addEventListener("mousedown", handler);
	overlay.addEventListener("touchstart", e => {
		e.preventDefault();
		handler();
	}, { passive: false });

	container.append(img, overlay);
	parent.appendChild(container);
}

function arrangeButtons() {

	upperBeads.innerHTML = "";
	lowerBeads.innerHTML = "";

	for (let col = 0; col < columns; col++) {
		createColumn(col, 1, upperBeads);
		createColumn(col, rows, lowerBeads, 1);
	}
	
	beadsContainer.style.visibility = Global.mode >= 2 ? "hidden" : "visible";
}

function setupToggle(img, srcOn, srcOff) {
	const toggleDown = () => (img.src = srcOn);
	const toggleUp = () => (img.src = srcOff);

	img.addEventListener("mousedown", toggleDown);
	img.addEventListener("mouseup", toggleUp);
	img.addEventListener("mouseleave", toggleUp);
	img.addEventListener("touchstart", e => {
		e.preventDefault();
		toggleDown();
	}, { passive: false });
	img.addEventListener("touchend", toggleUp);
}

function resetButtons(sound=true) {
	if (sound) AudioPlayer.playSound("decision42");
	states.forEach(col => col.fill(false));
	updateImages();
	updateSum();
}

function flashLines(lines, interval) {
	quiz.textContent = "";
	
	lines.forEach((line, i) => {
		setTimeout(() => {
		
			AudioPlayer.playSound("cursor1");
			quiz.textContent = line;

			if (i === lines.length - 1) {
				setTimeout(() => {
					quiz.textContent = "";
				}, interval * 1000);
			}
		}, i * interval * 1000);
	});
}

function replayFlashQuestion(interval) {
	const lines = currentQuestion.split("\n");
	
	flashLines(lines, interval);
}

function generateQuestion() {

	let numbers, operators, result;
	
	let ops;
	if(Global.category === 1){
		ops = ["×"];
	}else if (Global.category === 2){
		ops = ["÷"];
	}else{
		ops = ["+", "-"];
	}	

	let attempt = 0;
	const maxAttempts = 100;
	let isValid = false;
	
	while (!isValid && attempt < maxAttempts) {
		attempt++;

		if (Global.category === 1) {
		
			const digits1 = spec["dig1"];
			const digits2 = spec["dig2"];
		
			const first = Math.floor(Math.random() * (Math.pow(10, digits1) - Math.pow(10, digits1 - 1))) + Math.pow(10, digits1 - 1);
			let second;
			if(digits2 == 1)
				second = Math.floor(Math.random() * 8) + 2;
			else
				second = Math.floor(Math.random() * (Math.pow(10, digits2) - Math.pow(10, digits2 - 1))) + Math.pow(10, digits2 - 1);
			
			numbers = [first, second];
			operators = ["×"];
			result = first * second;
			isValid = true;

		} else if (Global.category === 2) {
			const digits1 = spec["dig1"];
			const digits2 = spec["dig2"];

			let minDivisor = digits2 === 1 ? 2 : Math.pow(10, digits2 - 1);
			let maxDivisor = digits2 === 1 ? 9 : Math.pow(10, digits2) - 1;

			const divisor = Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor;

			const minDividend = Math.pow(10, digits1 - 1);
			const maxDividend = Math.pow(10, digits1) - 1;

			const minQuotient = Math.ceil(minDividend / divisor);
			const maxQuotient = Math.floor(maxDividend / divisor);

			if (minQuotient <= maxQuotient) {
				let quotient;
				let quotientAttempts = 0;
				do {
					quotient = Math.floor(Math.random() * (maxQuotient - minQuotient + 1)) + minQuotient;
					quotientAttempts++;
					if (quotientAttempts > 100) break;
				} while (quotient === 1);

				const dividend = divisor * quotient;

				if (String(dividend).length === digits1 && quotient !== 1) {
					numbers = [dividend, divisor];
					operators = ["÷"];
					result = quotient;
					isValid = true;
				}
			}
		} else {

			const digits = spec["dig"];
			const qNum = spec["qNum"]

			numbers = Array.from({ length: qNum }, () => 
				Math.floor(Math.random() * (Math.pow(10, digits) - 1)) + 1
			);

			operators = Array.from({ length: qNum - 1 }, () => 
				ops[Math.floor(Math.random() * ops.length)]
			);

			isValid = true;
			for (let i = 1; i < numbers.length; i++) {
				if (numbers[i] === numbers[i - 1]) {
					isValid = false;
					break;
				}
			}

			result = numbers[0];			
			
			for (let i = 0; i < operators.length; i++) {
				result = operators[i] === "+" 
					? result + numbers[i + 1]
					: result - numbers[i + 1];

				if (result < 0) {
					isValid = false;
					break;
				}
			}
		}
	}

	if (!isValid) {
		quiz.textContent = "式の生成に失敗しました。";
		return;
	}
	
	console.log(numbers);

	currentAnswer = result;

	if( Global.mode === 3 || Global.category >= 1)
	{
		quiz.classList.add("number-big");
		quiz.classList.remove("number");
	}
	else
	{
		quiz.classList.add("number");
		quiz.classList.remove("number-big");
	}

	if (Global.mode === 3) {
		const lines = [numbers[0].toString()];
		for (let i = 0; i < operators.length; i++) {
			const sign = operators[i] === "-" ? "-" : "";
			lines.push(`${sign}${numbers[i + 1]}`);
		}

		quiz.textContent = "";

		currentQuestion = lines.join("\n");
		
		interval = spec["flash"];
		flashLines(lines, interval);

	} else {
		
		if (Global.category === 1) {
			currentQuestion = `${numbers[0]} × ${numbers[1]}`;
		} else if (Global.category === 2){
			currentQuestion = `${numbers[0]} ÷ ${numbers[1]}`;
		} else {
			const lines = [numbers[0].toString()];
			for (let i = 0; i < operators.length; i++) {
				const sign = operators[i] === "-" ? "-" : "";
				lines.push(`${sign}${numbers[i + 1]}`);
			}
			currentQuestion = lines.join("\n");
		}

		quiz.textContent = currentQuestion;
	}

	let fontSize = parseInt(window.getComputedStyle(quiz).fontSize);

	while (quiz.scrollHeight > quizContainer.clientHeight && fontSize > 0)
	{
		fontSize--;
		quiz.style.fontSize = fontSize + "px";
		debugger;
	}
}

function createKeypad() {
	const display = document.getElementById("keypad-display");
	display.textContent = "0";

	const backspaceBtn = document.getElementById("backspace-button");
	backspaceBtn.addEventListener("click", () => {
		AudioPlayer.playSound("decision42");
		keypadInput = keypadInput.slice(0, -1);
		display.textContent = keypadInput || "0";
	});

	const rows = [[7, 8, 9], [4, 5, 6], [1, 2, 3], [0]];
	rows.forEach(row => {
		const rowDiv = document.createElement("div");
		rowDiv.className = "keypad-row";
		row.forEach(num => rowDiv.appendChild(createPadButton(num)));
		keypadContainer.appendChild(rowDiv);
	});
}

function createPadButton(num) {
	const btn = document.createElement("div");
	btn.className = "keypad-button";

	const img = document.createElement("img");
	img.src = `img/keypad/pad_off_${num}.png`;
	btn.appendChild(img);

	const press = () => {
		AudioPlayer.playSound("onC");
		img.src = `img/keypad/pad_on_${num}.png`;
		addDigit(num);
	};

	const release = () => {
		img.src = `img/keypad/pad_off_${num}.png`;
	};

	btn.addEventListener("mousedown", press);
	btn.addEventListener("mouseup", release);
	btn.addEventListener("mouseleave", release);
	btn.addEventListener("touchstart", e => {
		e.preventDefault();
		press();
	}, { passive: false });
	btn.addEventListener("touchend", release);

	return btn;
}

function addDigit(digit) {
	if (keypadInput === "0") keypadInput = "";

	const newInput = keypadInput + digit.toString();

	if (parseInt(newInput, 10) > 9999) {
		return;
	}

	keypadInput = newInput;
	updateKeypadDisplay();
}

function resetKeypadInput() {
	keypadInput = "0";
	updateKeypadDisplay();
}

function updateKeypadDisplay() {
	const display = document.getElementById("keypad-display");
	if (display) display.textContent = keypadInput;
}

function enterKeypadMode() {

	isKeypadMode = true;

	keypadContainer.style.visibility = "visible";
	
	if (!(Global.category === 2 && Global.mode === 0)) {
		beadsContainer.style.visibility = "hidden";
	}
	
	resetKeypadInput();
}

function exitKeypadMode() {

	isKeypadMode = false;

	beadsContainer.style.visibility = "visible";

	if (!(Global.category === 2 && Global.mode === 0)) {
		keypadContainer.style.visibility = "hidden";
	}

	resetButtons(sound=false);
}

function judge() {

	let isCorrect;
	interval = spec["flash"];

	if (Global.mode >= 2) {
		isCorrect = parseInt(keypadInput, 10) === currentAnswer;
	} else if (Global.category === 2) {
		isCorrect = (sum === 0) && (parseInt(keypadInput, 10) === currentAnswer);
	} else {
		isCorrect = isKeypadMode ? parseInt(keypadInput, 10) === currentAnswer : sum === currentAnswer;
	}

	if (!isCorrect) {
		AudioPlayer.playSound("decision50");
		wrongCount++;

		if(running)
		{
			if (Global.mode <= 1 && isKeypadMode) 
			{
				exitKeypadMode();
			}
			if (Global.mode === 3) 
			{
				quiz.textContent = "";
				setTimeout(() => { 
					replayFlashQuestion(interval); 
				}, 1000);
			} 
			else 
			{
				quiz.textContent = currentQuestion;
			}
		}
		else
		{
			endingAbacus();
		}

	} else {
		AudioPlayer.playSound("correct");

		if (Global.mode <= 1 && Global.category != 2)
		{
			if(isKeypadMode)
			{
				correctCount++;
				exitKeypadMode();
				
				if(running)
				{
					generateQuestion();
				}
				else
				{
					endingAbacus();
				}
			}
			else
			{
				enterKeypadMode();			
			}
		}
		else{
			correctCount++;

			if(running)
			{
				if (Global.mode === 3) {
					setTimeout(() => { 
						generateQuestion(); 
					}, 1000);
				} 
				else 
				{
					generateQuestion();
				}
			}
			else
			{
				endingAbacus();
			}
		}
	}

	resetKeypadInput();
	resetButtons(sound=false);
}

async function getAbacusSpec() {

	//localStorage.removeItem('abacusSpec'); // RESET
	abacusSpec = JSON.parse(localStorage.getItem("abacusSpec"));
	
	if (!abacusSpec) {
		const response = await fetch("abacusSpec.json");
		abacusSpec = await response.json();
		localStorage.setItem("abacusSpec", JSON.stringify(abacusSpec));
	}

	//console.log(abacusSpec);
	
	let currentStatus = await getCurrentStatus();

	const key = `${Global.mode}-${Global.category}`;

	const level = currentStatus[key]["Lv"];

	spec = abacusSpec[Global.category][level];
	
}

async function startAbacus() 
{
	quiz.textContent = "";
	isKeypadMode = false;
	keypadInput = "0";
	correctCount = 0;
	wrongCount = 0;
	resetButtons(sound=false);
	
	await getAbacusSpec();
		
	updateKeypadDisplay();
	gauge_drawGauge(100);
	
	beadsContainer.style.visibility = Global.mode <= 1 ? "visible" : "hidden";
	keypadContainer.style.visibility = Global.mode <= 1 && !(Global.category === 2 && Global.mode === 0) ? "hidden" : "visible";
	boardContainer.style.display = "none";
	
	setTimeout(() => {
		AudioPlayer.playSound("girl1-youi1");
	}, 500);

	setTimeout(() => {
		boardContainer.style.display = "";
		AudioPlayer.playSound("girl1-start1");
		generateQuestion();
		runGauge();
	}, 2000);
}

function setupAbacus()
{
	arrangeButtons();
	createKeypad();

	setupToggle(resetBtn, "img/keypad/reset_on.png", "img/keypad/reset_off.png");
	setupToggle(checkBtn, "img/keypad/check_on.png", "img/keypad/check_off.png");

	const handleReset = () => {
		resetKeypadInput();
		resetButtons(sound=true);
	};

	resetBtn.addEventListener("mousedown", handleReset);
	resetBtn.addEventListener("touchend", handleReset);

	const handleCheck = () => judge();
	checkBtn.addEventListener("mousedown", handleCheck);
	checkBtn.addEventListener("touchend", handleCheck);
}
