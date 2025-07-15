// audioPlayer.js

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const audioBuffers = {};
const activeSources = {};
const useWebAudio = location.protocol === "http:" || location.protocol === "https:";

let soundNames = [];

async function loadSound(name) {
  const response = await fetch(`se/${name}.mp3`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[name] = buffer;
}

async function loadAllSounds() {
  const listResponse = await fetch("se/soundList.json");
  soundNames = await listResponse.json();
  await Promise.all(soundNames.map(loadSound));
}

function playSound(name) {
  if (!useWebAudio || !audioBuffers[name]) return;

  if (activeSources[name]) {
    try {
      activeSources[name].stop();
    } catch (e) {
      // Ignore
    }
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers[name];
  source.connect(audioContext.destination);
  source.start(0);

  activeSources[name] = source;

  source.onended = () => {
    if (activeSources[name] === source) {
      delete activeSources[name];
    }
  };
}

function unlockAudioContext() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

window.AudioPlayer = {
  playSound,
  loadAllSounds,
  unlockAudioContext
};

