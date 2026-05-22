let player;
let isMuted = false;
let controlsTimeout;
let lastTap = 0; 

// تهيئة مشغل YouTube بناءً على الـ ID الممرر من صفحة الـ HTML المفتوحة حالياً
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        videoId: currentVideoId,
        playerVars: {
            'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0,
            'modestbranding': 1, 'iv_load_policy': 3, 'disablekb': 1, 'fs': 0, 'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

const mainContainer = document.getElementById('main-player-container');
const customPoster = document.getElementById('custom-poster');
const vidMask = document.getElementById('vid-mask');
const controlsPanel = document.getElementById('controls-panel');
const playPauseBtn = document.getElementById('play-pause-btn');
const muteBtn = document.getElementById('mute-btn');
const progressTimeline = document.getElementById('progress-timeline');
const progressCurrent = document.getElementById('progress-current');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const volumeZone = document.getElementById('vol-zone');
const volumeTimeline = document.getElementById('volume-timeline');
const volumeCurrent = document.getElementById('volume-current');
const controlsLeft = document.querySelector('.controls-left');

// إنشاء أزرار السرعة والجودة ديناميكياً
const speedBtn = document.createElement('button');
speedBtn.className = 'control-btn';
speedBtn.innerHTML = '<i class="fas fa-gauge-high"></i>';
speedBtn.style.position = 'relative';
const speedMenu = document.createElement('div');
speedMenu.className = 'dropdown-menu-panel';
[0.5, 1, 1.5, 2].forEach(speed => {
    const opt = document.createElement('button');
    opt.innerText = speed === 1 ? 'عادي' : speed + 'x';
    opt.onclick = (e) => { e.stopPropagation(); player.setPlaybackRate(speed); speedMenu.style.display = 'none'; };
    speedMenu.appendChild(opt);
});
speedBtn.appendChild(speedMenu);
speedBtn.onclick = (e) => { e.stopPropagation(); qualityMenu.style.display = 'none'; speedMenu.style.display = speedMenu.style.display === 'flex' ? 'none' : 'flex'; };
controlsLeft.insertBefore(speedBtn, fullscreenBtn);

const qualityBtn = document.createElement('button');
qualityBtn.className = 'control-btn';
qualityBtn.innerHTML = '<i class="fas fa-sliders"></i>';
qualityBtn.style.position = 'relative';
const qualityMenu = document.createElement('div');
qualityMenu.className = 'dropdown-menu-panel';
qualityBtn.appendChild(qualityMenu);
qualityBtn.onclick = (e) => { e.stopPropagation(); speedMenu.style.display = 'none'; if(qualityMenu.style.display === 'flex') { qualityMenu.style.display = 'none'; } else { buildQualityMenu(); qualityMenu.style.display = 'flex'; } };
controlsLeft.insertBefore(qualityBtn, fullscreenBtn);

function buildQualityMenu() {
    qualityMenu.innerHTML = '';
    const levels = player.getAvailableQualityLevels();
    if(levels && levels.length > 0) {
        levels.forEach(level => {
            const opt = document.createElement('button');
            opt.innerText = level === 'default' ? 'تلقائي' : level;
            opt.onclick = (e) => { e.stopPropagation(); player.setPlaybackQuality(level); qualityMenu.style.display = 'none'; };
            qualityMenu.appendChild(opt);
        });
    } else { qualityMenu.innerHTML = '<button style="color:#aaa;">تلقائي</button>'; }
}

document.addEventListener('click', () => { speedMenu.style.display = 'none'; qualityMenu.style.display = 'none'; });
function onPlayerReady() { setInterval(updateProgress, 200); }

document.getElementById('img-start-trigger').addEventListener('click', () => {
    customPoster.classList.add('video-started');
    player.playVideo();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

playPauseBtn.addEventListener('click', togglePlay);
vidMask.addEventListener('click', togglePlay);

function togglePlay() {
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) { player.pauseVideo(); } else { customPoster.classList.add('video-started'); player.playVideo(); }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) { playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; } 
    else if (event.data === YT.PlayerState.PAUSED) { playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
}

function updateProgress() {
    if (player && player.getDuration) {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        if (duration > 0) { progressCurrent.style.width = ((currentTime / duration) * 100) + '%'; }
    }
}

progressTimeline.addEventListener('click', (e) => {
    const rect = progressTimeline.getBoundingClientRect();
    const duration = player.getDuration();
    if (duration > 0) { player.seekTo(duration * ((e.clientX - rect.left) / rect.width), true); }
});

muteBtn.addEventListener('click', () => {
    if (isMuted) { player.unMute(); muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; volumeCurrent.style.width = '100%'; } 
    else { player.mute(); muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>'; volumeCurrent.style.width = '0%'; }
    isMuted = !isMuted;
});

function setVolumeFromEvent(e) {
    const rect = volumeTimeline.getBoundingClientRect();
    let percentage = (e.clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    player.setVolume(Math.round(percentage * 100));
    volumeCurrent.style.width = (percentage * 100) + '%';
}
volumeTimeline.addEventListener('click', setVolumeFromEvent);

vidMask.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    if ((currentTime - lastTap) < 300 && (currentTime - lastTap) > 0) { toggleFullscreen(); e.preventDefault(); }
    lastTap = currentTime;
});
fullscreenBtn.addEventListener('click', toggleFullscreen);
function toggleFullscreen() { if (!document.fullscreenElement) { mainContainer.requestFullscreen(); } else { document.exitFullscreen(); } }

function showControls() {
    mainContainer.classList.remove('hide-controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => { if (player.getPlayerState() === YT.PlayerState.PLAYING) mainContainer.classList.add('hide-controls'); }, 3000); 
}
mainContainer.addEventListener('mousemove', showControls);
mainContainer.addEventListener('touchstart', showControls);
