/* eslint-disable space-before-function-paren */
/* eslint semi: "error" */

/* Get elements */
const videos = document.querySelectorAll('video');
videos.forEach(video => {
  video.sources = video.querySelectorAll('source');
});

/* Check video height and return optimal video src */
function autoQuality(video) {
  let newQuality = 10000;
  let newSrc;
  video.sources.forEach(function(source) {
    const videoWidth = video.offsetWidth * window.devicePixelRatio;
    const sourceQuality = Number(source.dataset.width);
    if (videoWidth <= sourceQuality &&
      sourceQuality <= newQuality) {
      newQuality = sourceQuality;
      newSrc = source.src;
    }
  });

  return newSrc;
}

/* If new quality is different than current quality, switch video sources */
function updateSource(video, newSrc) {
  if (video.currentSrc !== newSrc) {
    const currentTime = video.currentTime;
    const isPaused = video.paused;

    video.src = newSrc;
    video.currentTime = currentTime;
    if (!isPaused) {
      video.play();
    }
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

var debounceUpdateSources = debounce(function() {
  videos.forEach(video => updateSource(video, autoQuality(video)));
}, 250);

/* Add event listeners */
videos.forEach(video => video.addEventListener('loadedmetadata', () => {
  updateSource(video, autoQuality(video));
}, {
  once: true
}));

window.addEventListener('resize', debounceUpdateSources);
