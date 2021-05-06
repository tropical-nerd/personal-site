const loopers = document.querySelectorAll('.looper');
const pauseIcon = '<title id="pause-title">Pause</title><use xlink:href="#icon-pause" />';
const playIcon = '<title id="play-title">Play</title><use xlink:href="#icon-play" />';
  

function togglePlay(looper) {
    if (looper.video.paused) {
        looper.video.play();
        looper.classList.remove('looper-video-paused');
        looper.playToggle.setAttribute('title', 'Pause');
    } else {
        looper.video.pause();
        looper.classList.add('looper-video-paused');
        looper.playToggle.setAttribute('title', 'Play');
    }
}

function updatePlayToggle(looper) {
    if (looper.video.paused) {
        looper.playToggleIcon.innerHTML = playIcon;
    } else {
        setTimeout(() => {
            looper.playToggleIcon.innerHTML = pauseIcon;
        }, 100);
    }
}

function videoKeys(looper) {
    if (['Enter', 'Space'].includes(event.code)) {
        event.preventDefault();
        togglePlay(looper);
    }
}

loopers.forEach(looper => {
    looper.video = looper.querySelector('video');
    looper.playToggle = looper.querySelector('.looper-toggle');
    looper.playToggleIcon = looper.playToggle.querySelector('svg');

    looper.video.addEventListener('click', () => togglePlay(looper));
    looper.video.addEventListener('play', () => updatePlayToggle(looper));
    looper.video.addEventListener('pause', () => updatePlayToggle(looper));
    looper.video.addEventListener('keydown', () => videoKeys(looper));
    looper.playToggle.addEventListener('click', () => togglePlay(looper));

    // These attributes are initially in place incase JS does not load
    looper.video.removeAttribute('controls');
    looper.playToggle.removeAttribute('style');
});


