/* eslint-disable space-before-function-paren */
/* eslint semi: "error" */

/* Get our Elements */
const player = document.querySelector('.player');
const video = player.querySelector('.player__video');
const sourceNodes = video.querySelectorAll('source');
const sources = new Array(sourceNodes.length);
for (let i = 0; i < sources.length; i++) {
  sources[i] = {
    type: sourceNodes[i].getAttribute('type'),
    src: sourceNodes[i].getAttribute('src'),
    quality: Number(sourceNodes[i].getAttribute('data-quality'))
  };
}

// Make sure sources are in order for quality testing later
sources.sort(function(a, b) {
  return a.quality - b.quality;
});

const controls = player.querySelector('.player__controls');

const playToggle = player.querySelector('.player__play-toggle');
const playToggleIcon = playToggle.querySelector('svg');
const playIcon = playToggleIcon.innerHTML;
const pauseIcon =
  '<title id="play-title-0">Pause</title>' +
  '<use xlink:href="#player__icon--pause" />';

const progressTimeCurrent = player.querySelector('.player__time-current');
const progressTimeRemaining = player.querySelector('.player__time-remaining');
const progressRange = player.querySelector('.player__progress > input');
const muteToggle = player.querySelector('.player__mute-toggle');
const muteToggleIcon = muteToggle.querySelector('svg');
const muteIcon = muteToggleIcon.innerHTML;
const unmuteIcon =
  '<title id="mute-title-0">Unmute</title>' +
  '<use xlink:href="#player__icon--unmute" />';

const volumeRange = player.querySelector('.player__volume > input');

const qualityToggle = player.querySelector('.player__quality-toggle');
const qualityMenu = player.querySelector('.player__quality-menu');
const qualityMenuItems = player.querySelectorAll('.player__quality-menu__radio');

const fullscreenToggle = player.querySelector('.player__fullscreen-toggle');
const fullscreenToggleIcon = fullscreenToggle.querySelector('svg');
const fullscreenIcon = fullscreenToggleIcon.innerHTML;
const unfullscreenIcon =
  '<title id="fullscreen-title-0">Unfullscreen</title>' +
  '<use xlink:href="#player__icon--unfullscreen" />';

/* Build out functions */
function stringPadLeft(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);
  return stringPadLeft(minutes, '0', 2) + ':' + stringPadLeft(seconds, '0', 2);
}

function togglePlay() {
  if (video.paused) {
    video.play();
    playing = true;
  } else {
    video.pause();
    playing = false;
  }
}

function updatePlayToggle() {
  const icon = this.paused && mousedown === false ? playIcon : pauseIcon;
  playToggleIcon.innerHTML = icon;
}

function updateProgress() {
  const timeCurrent = Math.floor(video.currentTime);
  const timeRemaining = video.duration - timeCurrent;
  progressRange.value = video.currentTime / video.duration;
  progressTimeCurrent.textContent = formatTime(timeCurrent);
  progressTimeRemaining.textContent = formatTime(timeRemaining);
}

function scrub() {
  video.currentTime = progressRange.value * video.duration;
}

function toggleMute() {
  video.muted = !video.muted;
  updateAudioControls();
}

function updateAudioControls() {
  if (video.muted === true) {
    muteToggleIcon.innerHTML = unmuteIcon;
    volumeRange.value = 0;
  } else {
    muteToggleIcon.innerHTML = muteIcon;
    volumeRange.value = video.volume;
  }
}

function updateVolume() {
  video.muted = false;
  video.volume = this.value;
  updateAudioControls();
}

function hideMenu() {
  qualityMenu.classList.add('hidden');
  setTimeout(() => {
    qualityMenu.hidden = true;
    qualityToggle.setAttribute('aria-expanded', 'false');
  }, 200);
}

function toggleMenu() {
  if (qualityMenu.hidden === false) {
    hideMenu();
  } else {
    qualityMenu.hidden = false;
    setTimeout(() => qualityMenu.classList.remove('hidden'), 5);
    qualityToggle.setAttribute('aria-expanded', 'true');
  }
}

function autoQuality() {
  const videoHeight = video.offsetHeight;
  let newQuality;
  for (let i = 0; i < sources.length; i++) {
    if (videoHeight <= sources[i].quality) {
      newQuality = sources[i].quality;
      break;
    }
  }
  return newQuality;
}

function changeQuality() {
  const newQuality = sources[this.value].quality;
  updateSource(newQuality);
}

function updateSource(newQuality) {
  const currentSrc = new URL(video.currentSrc);
  const index = sources.findIndex(source => source.quality === newQuality);
  const newSrc = new URL(sources[index].src, currentSrc.origin);
  if (currentSrc.href !== newSrc.href) {
    const currentTime = video.currentTime;
    video.src = newSrc.href;
    video.currentTime = currentTime;
    if (playing === true) {
      video.play();
    }
  }
}

function updateMenu() {
  const currentSrc = new URL(video.currentSrc);
  const index = sources.findIndex(
    source => new URL(source.src, currentSrc.origin).href === currentSrc.href
  );
  qualityMenuItems[index].checked = true;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    player.requestFullscreen().then(() => { fullscreenToggleIcon.innerHTML = unfullscreenIcon; })
      .catch(err => {
        console.log(err);
      });
  } else {
    document.exitFullscreen();
    fullscreenToggleIcon.innerHTML = fullscreenIcon;
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this;
    var args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var checkSource = debounce(function() {
  updateSource(autoQuality());
}, 250);

function hideControls() {
  controls.classList.add('hidden');
}

var debounceHideControls = debounce(function() {
  hideControls();
}, 2000);

function showControls() {
  controls.classList.remove('hidden');
  debounceHideControls();
}

/* Hook up the event listeners */
let mousedown = false;
let playing = false;

video.addEventListener('loadedmetadata', () => {
  video.addEventListener('loadedmetadata', () => {
    updateProgress();
    updateAudioControls();
    updateMenu();
  });
  updateSource(autoQuality());
}, {
  once: true
});

video.addEventListener('click', togglePlay);
video.addEventListener('play', updatePlayToggle);
video.addEventListener('pause', updatePlayToggle);
video.addEventListener('timeupdate', updateProgress);

player.addEventListener('mouseleave', () => {
  hideMenu();
  hideControls();
});

player.addEventListener('mousemove', showControls);

playToggle.addEventListener('click', togglePlay);

progressRange.addEventListener('input', scrub);
progressRange.addEventListener('mousedown', () => {
  mousedown = true;
  if (playing === true) {
    video.pause();
  }
});

progressRange.addEventListener('mouseup', () => {
  mousedown = false;
  if (playing === true) {
    video.play();
  }
});

muteToggle.addEventListener('click', toggleMute);
volumeRange.addEventListener('input', updateVolume);

qualityToggle.addEventListener('click', toggleMenu);
qualityMenu.addEventListener('mouseleave', hideMenu);
qualityMenuItems.forEach(menuItem =>
  menuItem.addEventListener('change', changeQuality)
);

fullscreenToggle.addEventListener('click', toggleFullscreen);

/* Execute */

window.addEventListener('resize', checkSource);
