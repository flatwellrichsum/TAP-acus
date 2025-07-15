window.preloadedImages = {};

function preloadImages(onComplete) {
  fetch("images.json")
    .then(res => res.json())
    .then(paths => {
      let loadedCount = 0;
      const total = paths.length;

      if (total === 0) {
        if (onComplete) onComplete();
        return;
      }

      paths.forEach(path => {
        const img = new Image();
        img.src = path;

        img.onload = img.onerror = () => {
          window.preloadedImages[path] = img;
          loadedCount++;
          if (loadedCount === total) {
            if (onComplete) onComplete();
          }
        };
      });
    })
    .catch(err => {
      console.error("Failed to load images.json", err);
      if (onComplete) onComplete(); // ƒGƒ‰[‚Å‚àŒp‘±
    });
}
