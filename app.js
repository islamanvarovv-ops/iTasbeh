// LocalStorage bilan xavfsiz ishlash
const storage = {
    getItem: (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } },
    setItem: (key, val) => { try { localStorage.setItem(key, val); } catch (e) {} }
};

const duolar = [
    "Subhanalloh",
    "Alhamdulillah",
    "Allohu Akbar",
    "Laa ilaha illalloh",
    "Ya Fattahu, Iftah li abwaba rahmatik",
    "Astag'firullohal-'Aziym va atubu ilayh"
];

// DOM Elementlari
const counterDisplay = document.getElementById('counterDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const duoDisplay = document.getElementById('duoDisplay');
const plusBtn = document.getElementById('plusBtn');
const resetBtn = document.getElementById('resetBtn');
const confettiBox = document.getElementById('confettiBox');

const freezeToggleBtn = document.getElementById('freezeToggleBtn');
const vibroToggleBtn = document.getElementById('vibroToggleBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const taqvimModal = document.getElementById('taqvimModal');
const taqvimOpenBtn = document.getElementById('taqvimOpenBtn');
const taqvimCloseBtn = document.getElementById('taqvimCloseBtn');
const todayDateLabel = document.getElementById('todayDateLabel');

// Taqvim elementlari
const timeBomdod = document.getElementById('timeBomdod');
const timeQuyosh = document.getElementById('timeQuyosh');
const timePeshin = document.getElementById('timePeshin');
const timeAsr = document.getElementById('timeAsr');
const timeShom = document.getElementById('timeShom');
const timeXufton = document.getElementById('timeXufton');

// Saqlangan holatlar
let count = parseInt(storage.getItem('itasbeh_count')) || 0;
let totalSeconds = parseInt(storage.getItem('itasbeh_seconds')) || 0;
let soundEnabled = storage.getItem('itasbeh_sound') !== 'false';
let vibroEnabled = storage.getItem('itasbeh_vibro') !== 'false';
let isFrozen = storage.getItem('itasbeh_frozen') === 'true';

// UI Boshlang'ich holati
counterDisplay.textContent = count;
duoDisplay.textContent = duolar[Math.floor(count / 33) % duolar.length];

function updateUIState() {
    vibroToggleBtn.style.opacity = vibroEnabled ? '1' : '0.35';
    soundToggleBtn.style.opacity = soundEnabled ? '1' : '0.35';
    if (isFrozen) {
        freezeToggleBtn.classList.add('active-freeze');
    } else {
        freezeToggleBtn.classList.remove('active-freeze');
    }
}
updateUIState();

// Web Audio API orqali ovoz chiqorish
let audioCtx = null;
function playSound() {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch(e){}
}

function vibrate() {
    if (vibroEnabled && navigator.vibrate) {
        try { navigator.vibrate(40); } catch(e){}
    }
}

function triggerSparkles() {
    for(let i = 0; i < 20; i++) {
        let sp = document.createElement('div');
        sp.className = 'sparkle';
        sp.style.left = Math.random() * 100 + '%';
        sp.style.top = Math.random() * 50 + '%';
        confettiBox.appendChild(sp);
        setTimeout(() => sp.remove(), 1200);
    }
}

function handleIncrement() {
    if (isFrozen) return;
    playSound();
    vibrate();
    count++;
    counterDisplay.textContent = count;
    storage.setItem('itasbeh_count', count);

    // Har 33 ta sanoqda duo o'zgaradi va effekt beradi
    if (count % 33 === 0 && count > 0) {
        triggerSparkles();
        duoDisplay.textContent = duolar[Math.floor(count / 33) % duolar.length];
    }
}

plusBtn.addEventListener('click', handleIncrement);

// Probel (Space) yoki Enter bosilganda sanash
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleIncrement();
    }
});

// Taymer (Vaqt o'lchagich)
setInterval(() => {
    if (!isFrozen) {
        totalSeconds++;
        storage.setItem('itasbeh_seconds', totalSeconds);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${h}:${m}:${s}`;
    }
}, 1000);

// Togglelar
freezeToggleBtn.addEventListener('click', () => {
    isFrozen = !isFrozen;
    storage.setItem('itasbeh_frozen', isFrozen);
    updateUIState();
});

vibroToggleBtn.addEventListener('click', () => {
    vibroEnabled = !vibroEnabled;
    storage.setItem('itasbeh_vibro', vibroEnabled);
    updateUIState();
});

soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    storage.setItem('itasbeh_sound', soundEnabled);
    updateUIState();
});

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
});

resetBtn.addEventListener('click', () => {
    if (confirm("Tasbeh va vaqtni nollamoqchimisiz?")) {
        count = 0; totalSeconds = 0;
        counterDisplay.textContent = count;
        duoDisplay.textContent = duolar[0];
        storage.setItem('itasbeh_count', 0);
        storage.setItem('itasbeh_seconds', 0);
    }
});

// Namoz Vaqtlarini API orqali olish (Aladhan API)
async function fetchPrayerTimes() {
    try {
        todayDateLabel.textContent = "Yuklanmoqda...";
        // Toshkent uchun standart API so'rovi
        let response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Tashkent&country=Uzbekistan&method=3');
        let data = await response.json();
        
        if (data.code === 200) {
            let t = data.data.timings;
            let date = data.data.date.readable;
            
            todayDateLabel.textContent = `Bugun: ${date} (Toshkent)`;
            timeBomdod.textContent = t.Fajr;
            timeQuyosh.textContent = t.Sunrise;
            timePeshin.textContent = t.Dhuhr;
            timeAsr.textContent = t.Asr;
            timeShom.textContent = t.Maghrib;
            timeXufton.textContent = t.Isha;
        }
    } catch (err) {
        todayDateLabel.textContent = "Internet aloqasi yo'q (Oflayn)";
    }
}

// Taqvim Modal boshqaruvi
taqvimOpenBtn.addEventListener('click', () => {
    taqvimModal.classList.add('active');
    fetchPrayerTimes();
});
taqvimCloseBtn.addEventListener('click', () => taqvimModal.classList.remove('active'));
taqvimModal.addEventListener('click', (e) => { if(e.target === taqvimModal) taqvimModal.classList.remove('active'); });

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { 
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA tayyor:', reg.scope))
            .catch(err => console.log('SW xato:', err)); 
    });
}