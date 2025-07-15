function setupAudio()
{
	AudioPlayer.unlockAudioContext();
	AudioPlayer.loadAllSounds();
}

function setupTouchPrevention()
{
	document.addEventListener("touchstart", e => {
		if (e.target === document) e.preventDefault();
	}, { passive: false });

	document.addEventListener("touchend", e => {
		if (e.target === document) e.preventDefault();
	}, { passive: false });
}

function clearAllTimers()
{
	if(Global.timeoutList)
	{
		Global.timeoutList.forEach(id => clearTimeout(id));
		Global.timeoutList.length = 0;
	}
	if(Global.intervalList)
	{
		Global.intervalList.forEach(id => clearInterval(id));
		Global.intervalList.length = 0;
	}
}

function stopAllSounds() {
  for (const name in activeSources) {
    try {
      activeSources[name].stop();
    } catch (e) {
      console.warn(`Sound ${name} already stopped or failed to stop.`);
    }
  }

  for (const name in activeSources) {
    delete activeSources[name];
  }
}

function switchToScreen(nextScreenId)
{
	const iris = document.getElementById("iris");

	document.body.classList.remove("transition-out");
	document.body.classList.add("transition-in");

	stopAllSounds();
	clearAllTimers();
	
	AudioPlayer.playSound("decision28");

	if(nextScreenId==="menu-screen")
	{
		updateMenu();
		changeMenuReaction();
		setTimeout(() => {
			AudioPlayer.playSound("girl1-modewoerandene1");
		}, 1000);
	}

	setTimeout(() => {
		const allScreens = document.querySelectorAll(".screen");
		allScreens.forEach(screen => screen.classList.remove("visible"));

		const next = document.getElementById(nextScreenId);
		if (next) {
			next.classList.add("visible");
			currentScreenId = nextScreenId;
		} else {
			console.warn(`No screen found with ID "${nextScreenId}"`);
		}

		document.body.classList.remove("transition-in");
		document.body.classList.add("transition-out");

	}, 300);
}

function getCurrentStatus() 
{
  let currentStatus = JSON.parse(localStorage.getItem("currentStatus"));

  if (!currentStatus) {
    currentStatus = {
      "0-0": { "Lv": 8,  "hearts": 2 },
      "1-0": { "Lv": 8,  "hearts": 2 },
      "2-0": { "Lv": 8,  "hearts": 2 },
      "3-0": { "Lv": 8,  "hearts": 2 },
      "0-1": { "Lv": 10, "hearts": 2 },
      "1-1": { "Lv": 10, "hearts": 2 },
      "2-1": { "Lv": 10, "hearts": 2 },
      "0-2": { "Lv": 11, "hearts": 2 },
      "2-2": { "Lv": 11, "hearts": 2 }
    };

    localStorage.setItem("currentStatus", JSON.stringify(currentStatus));
  }

  return currentStatus;
}

function setupDebug() {
  let isDrawing = false;
  let points = [];

  function getPos(e) {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      return { x: t.clientX, y: t.clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  function startDraw(e) {
    isDrawing = true;
    points = [getPos(e)];
  }

  function moveDraw(e) {
    if (!isDrawing) return;
    points.push(getPos(e));
  }

  function endDraw(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (detectCircle(points)) {
      window.location.href = "debug.html";
    }
    points = [];
  }

  function detectCircle(pts) {
    if (pts.length < 10) return false;

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    const distances = pts.map(p => Math.hypot(p.x - centerX, p.y - centerY));
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((a, b) => a + (b - avgDist) ** 2, 0) / distances.length;
    const stddev = Math.sqrt(variance);
    if (stddev > avgDist * 0.25) return false;

    const angles = pts.map(p => Math.atan2(p.y - centerY, p.x - centerX));
    let totalTurn = 0;
    for (let i = 1; i < angles.length; i++) {
      let delta = angles[i] - angles[i - 1];
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      totalTurn += delta;
    }

    const loopedEnough = Math.abs(totalTurn) >= 3 * Math.PI;

    const dx = pts[pts.length - 1].x - pts[0].x;
    const dy = pts[pts.length - 1].y - pts[0].y;
    const returnClose = Math.hypot(dx, dy) < avgDist * 0.5;

    return loopedEnough && returnClose;
  }

  window.addEventListener('mousedown', startDraw);
  window.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);

  window.addEventListener('touchstart', startDraw, { passive: false });
  window.addEventListener('touchmove', moveDraw, { passive: false });
  window.addEventListener('touchend', endDraw, { passive: false });
}



function initialSetups()
{
	setupTouchPrevention();
	setupOpening();
	setupCalendar();
	setupMenu();
	setupAbacus();
	setupResult();
	setupDebug();
}