let isMuted = false;
let controlsTimeout;
let lastTap = 0; 

// 1. جلب عنصر الفيديو الـ HTML5 المباشر (بديل يوتيوب)
const html5Player = document.getElementById('my-html5-player'); 

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

// 2. تحديث دالة تشغيل الفيديو عند استقبال الرابط من الفايربيز ديناميكياً
// يمكنك مناداة هذه الدالة وتمرير رابط الفايربيز المباشر لها
function loadFirebaseVideo(firebaseVideoUrl) {
    const videoSource = document.getElementById('video-source');
    videoSource.src = firebaseVideoUrl;
    html5Player.load(); // إعادة تحميل المشغل بالرابط الجديد
}

// تشغيل العداد لتحديث الشريط بمجرد جاهزية الفيديو
html5Player.addEventListener('loadedmetadata', () => {
    setInterval(updateProgress, 200);
});

// إنشاء أزرار السرعة ديناميكياً (قائمتك الاحترافية كما هي)
const speedBtn = document.createElement('button');
speedBtn.className = 'control-btn';
speedBtn.innerHTML = '<i class="fas fa-gauge-high"></i>';
speedBtn.style.position = 'relative';
const speedMenu = document.createElement('div');
speedMenu.className = 'dropdown-menu-panel';
[0.5, 1, 1.5, 2].forEach(speed => {
    const opt = document.createElement('button');
    opt.innerText = speed === 1 ? 'عادي' : speed + 'x';
    opt.onclick = (e) => { 
        e.stopPropagation(); 
        html5Player.playbackRate = speed; // تغيير السرعة مباشرة في الـ HTML5
        speedMenu.style.display = 'none'; 
    };
    speedMenu.appendChild(opt);
});
speedBtn.appendChild(speedMenu);
speedBtn.onclick = (e) => { 
    e.stopPropagation(); 
    speedMenu.style.display = speedMenu.style.display === 'flex' ? 'none' : 'flex'; 
};
controlsLeft.insertBefore(speedBtn, fullscreenBtn);

// ملحوظة: في الـ HTML5 الفيديو الأصلي بيعرض الجودة المرفوعة تلقائياً (مثل 720p أو 1080p)، 
// تم الاستغناء عن زر الجودة الخاص بـ يوتيوب لأن الفايربيز يشغل الملف المباشر الأصلي بأعلى جودة.

document.addEventListener('click', () => { speedMenu.style.display = 'none'; });

// تشغيل الفيديو عند الضغط على البوستر الإعلاني
document.getElementById('img-start-trigger').addEventListener('click', () => {
    customPoster.classList.add('video-started');
    html5Player.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});

playPauseBtn.addEventListener('click', togglePlay);
vidMask.addEventListener('click', togglePlay);

function togglePlay() {
    if (html5Player.paused) { 
        customPoster.classList.add('video-started'); 
        html5Player.play(); 
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else { 
        html5Player.pause(); 
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// تحديث شريط التقدم بناءً على وقت الفيديو الحالي
function updateProgress() {
    if (html5Player.duration > 0) {
        const duration = html5Player.duration;
        const currentTime = html5Player.currentTime;
        progressCurrent.style.width = ((currentTime / duration) * 100) + '%';
    }
}

// تقديم وتأخير الفيديو عند الضغط على الـ Timeline
progressTimeline.addEventListener('click', (e) => {
    const rect = progressTimeline.getBoundingClientRect();
    const duration = html5Player.duration;
    if (duration > 0) { 
        html5Player.currentTime = duration * ((e.clientX - rect.left) / rect.width); 
    }
});

// كتم الصوت وتفعيله
muteBtn.addEventListener('click', () => {
    if (isMuted) { 
        html5Player.muted = false; 
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; 
        volumeCurrent.style.width = '100%'; 
    } else { 
        html5Player.muted = true; 
        muteBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>'; 
        volumeCurrent.style.width = '0%'; 
    }
    isMuted = !isMuted;
});

// التحكم بمستوى الصوت من الشريط
function setVolumeFromEvent(e) {
    const rect = volumeTimeline.getBoundingClientRect();
    let percentage = (e.clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    html5Player.volume = percentage; // المتصفح يقبل القيمة من 0 إلى 1
    volumeCurrent.style.width = (percentage * 100) + '%';
}
volumeTimeline.addEventListener('click', setVolumeFromEvent);

// الدبل كليك لتفعيل الشاشة الكاملة على الـ Mask
vidMask.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    if ((currentTime - lastTap) < 300 && (currentTime - lastTap) > 0) { toggleFullscreen(); e.preventDefault(); }
    lastTap = currentTime;
});
fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() { 
    if (!document.fullscreenElement) { 
        mainContainer.requestFullscreen(); 
    } else { 
        document.exitFullscreen(); 
    } 
}

// إخفاء وإظهار لوحة التحكم تلقائياً
function showControls() {
    mainContainer.classList.remove('hide-controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => { 
        if (!html5Player.paused) mainContainer.classList.add('hide-controls'); 
    }, 3000); 
}
mainContainer.addEventListener('mousemove', showControls);
mainContainer.addEventListener('touchstart', showControls);

// منع كليك يمين نهائياً على حاوية الفيديو بالكامل لزيادة الحماية
mainContainer.addEventListener('contextmenu', e => e.preventDefault());
