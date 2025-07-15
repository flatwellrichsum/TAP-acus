let currentDate = new Date();
const today = new Date();

function pad(n)
{
	return String(n).padStart(2, "0");
}

function setupFinishedCountIfNeeded(year, month, todayDate)
{
	const key = "finishedCount";
	let finishedData = JSON.parse(localStorage.getItem(key) || "{}");

	const yyyymm = `${year}${pad(month)}`;
	for (let day = 1; day < todayDate; day++) {
		const fullDate = yyyymm + pad(day);
		if (!finishedData[fullDate]) {
			finishedData[fullDate] = [2, 2];
		}
	}

	const todayKey = `${yyyymm}${pad(todayDate)}`;
	if (!finishedData[todayKey]) {
		finishedData[todayKey] = [0, 2];
	}

	localStorage.setItem(key, JSON.stringify(finishedData));
	return finishedData;
}


function getImageDaysFromStorage(year, month, finishedData)
{
	const yyyymm = `${year}${pad(month)}`;
	const lastDate = new Date(year, month, 0).getDate();
	const imageDays = [];

	for (let day = 1; day <= lastDate; day++) {
		const key = yyyymm + pad(day);
		const data = finishedData[key];
		if (data && data[0] >= data[1]) {
			imageDays.push(day);
		}
	}
	return imageDays;
}

function updateMessage(data) 
{
	const message = document.getElementById("message");
	if (!data) {
		message.textContent = "";
		return;
	}

	const [actual, goal] = data;
	const remaining = Math.max(0, goal - actual);

	if (actual >= goal) {
		message.textContent = "ノルマおしまい！おつかれさま！";
	} else {
		message.textContent = `今日のノルマ：あと ${remaining} 面`;
	}
}

function renderCalendar(year, month, finishedData)
{
	const isCurrentMonth = (
		year === today.getFullYear() &&
		month === today.getMonth() + 1
	);
	const animateDay = isCurrentMonth ? today.getDate() : -1;
	const todayKey = `${year}${pad(month)}${pad(today.getDate())}`;
	const todayData = finishedData[todayKey] || null;

	document.getElementById("calendar-title").textContent = `${year}年 ${month}月`;
	updateMessage(isCurrentMonth ? todayData : null);

	const weekdayLabels = document.getElementById("weekday-labels");
	const calendarGrid = document.getElementById("calendar-grid");
	weekdayLabels.innerHTML = "";
	calendarGrid.innerHTML = "";

	const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
	for (let i = 0; i < 7; i++) {
		const label = document.createElement("div");
		label.className = "day-label";
		label.textContent = weekdays[i];
		weekdayLabels.appendChild(label);
	}

	const firstDate = new Date(year, month - 1, 1);
	const lastDate = new Date(year, month, 0);
	const totalDays = lastDate.getDate();
	const firstWeekday = firstDate.getDay();
	const totalCells = 42;

	const imageDays = getImageDaysFromStorage(year, month, finishedData);

	for (let i = 0; i < totalCells; i++) {
		const tile = document.createElement("div");
		tile.className = "tile";

		const date = i - firstWeekday + 1;
		const x = i % 7;
		const y = Math.floor(i / 7);

		const numberSpan = document.createElement("span");
		numberSpan.className = "number";

		const imageDiv = document.createElement("div");
		imageDiv.className = "image-bg";
		const imagePath = `img/calendar/${year}${pad(month)}.png`;
		imageDiv.style.backgroundImage = `url("${imagePath}")`;
		imageDiv.style.backgroundPosition = `-${x * 90}px -${y * 90}px`;

		const dateKey = `${year}${pad(month)}${pad(date)}`;
		const dayData = finishedData[dateKey];

		if (date < 1 || date > totalDays) {
			numberSpan.textContent = "";
			imageDiv.style.opacity = "1";
			imageDiv.style.transform = "scale(1)";
		} else if (dayData && dayData[0] >= dayData[1]) {
			numberSpan.textContent = "";
			imageDiv.style.opacity = "1";
			imageDiv.style.transform = "scale(1)";
		} else {
			numberSpan.textContent = date;
		}

		if (isCurrentMonth && date === animateDay) {
			tile.dataset.today = "true";
			tile.dataset.countToday = dayData ? dayData[0] : 0;
			if (!dayData || dayData[0] < dayData[1]) {
				tile.classList.add("today-mark");
			}
		}

		tile.appendChild(numberSpan);
		tile.appendChild(imageDiv);
		calendarGrid.appendChild(tile);
	}

	if (isCurrentMonth && todayData && todayData[0] >= todayData[1]) {
		animateCalendar();
	}
}

function setupCalendar()
{
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const finishedData = setupFinishedCountIfNeeded(
		today.getFullYear(),
		today.getMonth() + 1,
		today.getDate()
	);
	renderCalendar(year, month, finishedData);
}


function animateCalendar()
{
	const tile = [...document.querySelectorAll(".tile")].find(t => t.dataset.today === "true");
	if (!tile) return;

	const img = tile.querySelector(".image-bg");

	img.style.transition = "none";
	img.style.opacity = "0";
	img.style.transform = "scale(3)";

	setTimeout(() => {
		img.style.transition = "";
		img.style.opacity = "1";
		img.style.transform = "scale(1)";
		const num = tile.querySelector(".number");
		num.textContent = "";
	}, 100);

	setTimeout(() => {
		AudioPlayer.playSound("girl1-o1");
	}, 500);

	setTimeout(() => {
		AudioPlayer.playSound("cute-pose2");
		AudioPlayer.playSound("people-performance-cheer2");
	}, 2000);

	setTimeout(() => {
		AudioPlayer.playSound("girl1-oo1");
	}, 2500);

	setTimeout(() => {
		AudioPlayer.playSound("girl1-ehehe1");
	}, 4000);

	setTimeout(() => {
		AudioPlayer.playSound("girl1-ganbattane1");
	}, 5000);

	setTimeout(() => {
		const rect = tile.getBoundingClientRect();
		spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, document.body);
		tile.classList.remove("animating");
	}, 2000);

	tile.classList.add("animating");
}

function updateCalendar() {
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const isCurrentMonth = (
		year === today.getFullYear() &&
		month === today.getMonth() + 1
	);
	if (!isCurrentMonth) return;

	const key = "finishedCount";
	const finishedData = setupFinishedCountIfNeeded(
		today.getFullYear(),
		today.getMonth() + 1,
		today.getDate()
	);

	const todayKey = `${year}${pad(month)}${pad(today.getDate())}`;
	const dayData = finishedData[todayKey];

	localStorage.setItem(key, JSON.stringify(finishedData));

	updateMessage(dayData);

	if (dayData[0] >= dayData[1]) {
		animateCalendar();
	} else {
		setTimeout(() => {
			AudioPlayer.playSound("girl1-otsukaresamadeshita1");
		}, 800);
	}
}


function explodeCellToImage(day) {
	const tile = [...document.querySelectorAll(".tile")].find(el => {
		const num = el.querySelector(".number");
		return num && num.textContent === String(day);
	});
	if (!tile) return;

	tile.classList.add("animating");

	const rect = tile.getBoundingClientRect();
	const originX = rect.left + rect.width / 2;
	const originY = rect.top + rect.height / 2;

	setTimeout(() => {
		const num = tile.querySelector(".number");
		const img = tile.querySelector(".image-bg");
		num.textContent = "";
		tile.classList.remove("animating");
		img.style.opacity = "1";
		img.style.transform = "scale(1)";

		const bang = document.getElementById("bang-sound");
		bang.currentTime = 0;
		bang.play();
	}, 600);

	setTimeout(() => {
		spawnParticles(originX, originY, document.body);
	}, 2000);
}

function spawnParticles(x, y, container) {
	for (let i = 0; i < 25; i++) {
		const particle = document.createElement("div");
		particle.className = "particle star";
		particle.textContent = "★";

		const dx = (Math.random() - 0.5) * 240 + "px";
		const dy = (Math.random() - 0.5) * 240 + "px";

		const hue = Math.floor(Math.random() * 360);
		particle.style.color = `hsl(${hue}, 100%, 60%)`;

		particle.style.left = x + "px";
		particle.style.top = y + "px";
		particle.style.setProperty("--dx", dx);
		particle.style.setProperty("--dy", dy);

		container.appendChild(particle);
		setTimeout(() => particle.remove(), 1000);
	}
}

document.getElementById("prev-btn").onclick = () => {
	AudioPlayer.playSound("decision34");
	currentDate.setMonth(currentDate.getMonth() - 1);
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const finishedData = JSON.parse(localStorage.getItem("finishedCount") || "{}");
	renderCalendar(year, month, finishedData);
};

document.getElementById("next-btn").onclick = () => {
	AudioPlayer.playSound("decision34");
	currentDate.setMonth(currentDate.getMonth() + 1);
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const finishedData = JSON.parse(localStorage.getItem("finishedCount") || "{}");
	renderCalendar(year, month, finishedData);
};

document.getElementById("back-button").addEventListener("click", () => {
	switchToScreen("menu-screen");
});
