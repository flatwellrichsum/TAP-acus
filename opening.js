function createPreloadImages(onComplete) {
  fetch("images.json")
    .then(res => res.json())
    .then(paths => {
      const openingScreen = document.getElementById("opening-screen");

      const preloadDiv = document.createElement("div");
      preloadDiv.id = "preload-images";
      preloadDiv.style.position = "absolute";
      preloadDiv.style.top = "0";
      preloadDiv.style.left = "0";
      preloadDiv.style.width = "100%";
      preloadDiv.style.height = "100%";
      preloadDiv.style.zIndex = "-1";
      preloadDiv.style.pointerEvents = "none";
      preloadDiv.style.overflow = "hidden";
      preloadDiv.style.opacity = "0";

      let loadedCount = 0;
      const total = paths.length;

      paths.forEach(path => {
        const img = document.createElement("img");
        img.src = path;
        img.alt = "preload";
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === total) {
            preloadDiv.remove();
            if (onComplete) onComplete();
          }
        };
        preloadDiv.appendChild(img);
      });

      openingScreen.insertBefore(preloadDiv, openingScreen.firstChild);
    })
    .catch(err => {
      console.error("Couldn't load images.json", err);
      if (onComplete) onComplete();
    });
}

function switchToMenu()
{
    document.getElementById("title-image").addEventListener("click", () => {
		AudioPlayer.unlockAudioContext();
		AudioPlayer.loadAllSounds();
		switchToScreen("calendar-screen");
    });
}

function setupOpening()
{
	createPreloadImages();
	switchToMenu();
}