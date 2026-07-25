// Uses global functions from sound.js and fireworks.js (loaded as plain
// scripts before this file — see index.html).

const BIRTHDAY_MESSAGE =
  "Happy birthday, Denise! I hope today treats you exactly the way you deserve — which, knowing you, is with a lot of attention. Here's to another year of you being unapologetically yourself, glasses and all. Go be the prettiest girl in every room today, like you already believe you are.you the work of something great.";

const GIFTS = [
  { id: 'birthday', label: 'Happy Birthday', color: '#ff9fc7', colorDark: '#e07aa5', scene: 'scene-birthday' },
  { id: 'photos', label: 'Pictures', color: '#7ec8e3', colorDark: '#5aa7c4', scene: 'scene-photos' },
  { id: 'us', label: 'Us', color: '#c8a2ff', colorDark: '#a084d6', scene: 'scene-us' },
];

const PHOTO_COUNT = 6;

// ---------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------
const appRoot = document.getElementById('app-root');
const particleField = document.getElementById('particle-field');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const shootingStarLayer = document.getElementById('shooting-star-layer');
const moonBtn = document.getElementById('moon-btn');
const muteBtn = document.getElementById('mute-btn');
const bgAudio = document.getElementById('bg-audio');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = musicToggle.querySelector('.music-label');

const sceneSelect = document.getElementById('scene-select');
const landingCopy = document.getElementById('landing-copy');
const giftRow = document.getElementById('gift-row');
const continueBtn = document.getElementById('continue-btn');

const sceneBirthday = document.getElementById('scene-birthday');
const birthdayTyped = document.getElementById('birthday-typed');

const scenePhotos = document.getElementById('scene-photos');
const photoGrid = document.getElementById('photo-grid');

const sceneUs = document.getElementById('scene-us');

const sceneFinal = document.getElementById('scene-final');
const balloonsLayer = document.getElementById('balloons-layer');
const cake = document.getElementById('cake');
const cakeCandles = document.getElementById('cake-candles');
const cakeHint = document.getElementById('cake-hint');
const micBtn = document.getElementById('mic-btn');

const secretOverlay = document.getElementById('secret-overlay');

const ALL_SCENES = [sceneSelect, sceneBirthday, scenePhotos, sceneUs, sceneFinal];
const openedGifts = new Set();

// ---------------------------------------------------------------
// Ambient particle field
// ---------------------------------------------------------------
const SYMBOLS = { snow: '❄', star: '✦', heart: '♥', glitter: '✧' };

function spawnParticles(types, count) {
  particleField.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const el = document.createElement('span');
    el.className = `particle particle-${type}`;
    el.textContent = SYMBOLS[type];
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 14;
    const delay = Math.random() * -20;
    const drift = (Math.random() - 0.5) * 60;
    const size = 0.6 + Math.random() * 1.4;
    el.style.left = `${left}%`;
    el.style.fontSize = `${size}rem`;
    el.style.setProperty('--drift', `${drift}px`);
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    if (type === 'star') {
      el.addEventListener('click', () => spawnShootingStar(left));
    }
    particleField.appendChild(el);
  }
}

function spawnShootingStar(left) {
  const el = document.createElement('div');
  el.className = 'shooting-star';
  el.style.left = `${left}%`;
  shootingStarLayer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// ---------------------------------------------------------------
// Gift boxes (replaces the old penguin picker)
// ---------------------------------------------------------------
function giftBoxMarkup() {
  return `
    <div class="gift-slot-glow"></div>
    <div class="gift-box gift-slot-box">
      <div class="gift-lid"></div>
      <div class="gift-ribbon-v"></div>
      <div class="gift-ribbon-h"></div>
      <div class="gift-bow">🎀</div>
      <div class="gift-box-body"></div>
      <div class="gift-sparkles"></div>
    </div>
    <span class="gift-slot-check">✅</span>
  `;
}

function buildGifts() {
  giftRow.innerHTML = '';
  GIFTS.forEach((g) => {
    const wrap = document.createElement('button');
    wrap.className = 'gift-slot';
    wrap.id = `gift-${g.id}`;
    wrap.setAttribute('aria-label', `Open the ${g.label} gift`);
    wrap.style.setProperty('--gift-color', g.color);
    wrap.style.setProperty('--gift-color-dark', g.colorDark);
    wrap.innerHTML = `
      ${giftBoxMarkup()}
      <span class="gift-slot-label">${g.label}</span>
    `;
    wrap.querySelector('.gift-slot-glow').style.background =
      `radial-gradient(circle, ${g.color} 0%, transparent 70%)`;

    wrap.addEventListener('click', () => handleOpenGift(g, wrap));
    giftRow.appendChild(wrap);
  });
}

function handleOpenGift(gift, wrap) {
  playSound('gift');
  wrap.classList.add('opened');
  const box = wrap.querySelector('.gift-slot-box');
  box.classList.add('opened');

  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff9fc7', '#c8a2ff', '#7ec8e3', '#fff2b2'],
    });
  }
  setTimeout(() => playSound('confetti'), 200);

  openedGifts.add(gift.id);
  if (openedGifts.size === GIFTS.length) {
    continueBtn.classList.remove('hidden');
  }

  setTimeout(() => goToScene(gift.scene), 700);
}

// ---------------------------------------------------------------
// Scene switching
// ---------------------------------------------------------------
function goToScene(sceneId) {
  ALL_SCENES.forEach((s) => s.classList.add('hidden'));
  const target = document.getElementById(sceneId);
  target.classList.remove('hidden');

  if (sceneId === 'scene-birthday') setupBirthdayScene();
  if (sceneId === 'scene-photos') setupPhotosScene();
  if (sceneId === 'scene-final') setupFinalScene();
}

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => goToScene('scene-select'));
});

continueBtn.addEventListener('click', () => goToScene('scene-final'));

// ---------------------------------------------------------------
// Birthday message scene (typewriter)
// ---------------------------------------------------------------
let typewriterTimer = null;
let birthdayTypedOnce = false;

function setupBirthdayScene() {
  if (birthdayTypedOnce) return; // don't retype if they come back
  birthdayTypedOnce = true;
  birthdayTyped.textContent = '';
  clearInterval(typewriterTimer);
  let i = 0;
  typewriterTimer = setInterval(() => {
    i++;
    birthdayTyped.textContent = BIRTHDAY_MESSAGE.slice(0, i);
    if (i >= BIRTHDAY_MESSAGE.length) clearInterval(typewriterTimer);
  }, 20);
}

// ---------------------------------------------------------------
// Photos scene
// ---------------------------------------------------------------
let photosBuilt = false;

function setupPhotosScene(){
  if(photosBuilt) return;
  photosBuilt = true
  photoGrid.innerHTML ='';
  const files = ['denise-1.jpg','denise-2.jpg','denise-3.jpg','denise-4.jpg','denise-5.jpg','denise-6.jpg','denise-7.jpg','denise-8.jpg'];
  files.forEach((f) => {
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    slot.innerHTML = `<img src="photos/${f}" alt="Denise">`;
    photoGrid.appendChild(slot);
  })
}

// ---------------------------------------------------------------
// Final celebration scene (balloons, cake)
// ---------------------------------------------------------------
const BALLOONS = [
  { color: '#ff9fc7', left: '10%', delay: 0 },
  { color: '#c8a2ff', left: '25%', delay: 2 },
  { color: '#7ec8e3', left: '70%', delay: 1 },
  { color: '#fff2b2', left: '85%', delay: 3 },
  { color: '#ffb6d5', left: '50%', delay: 4 },
];

let finalSceneReady = false;

function setupFinalScene() {
  startFireworks({ interval: 900 });
  if (!finalSceneReady) {
    balloonsLayer.innerHTML = '';
    BALLOONS.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'balloon';
      el.style.left = b.left;
      el.style.background = b.color;
      el.style.animationDuration = '10s';
      el.style.animationDelay = `${b.delay}s`;
      balloonsLayer.appendChild(el);
    });
    finalSceneReady = true;
  }
}

let cakeLit = false;
let candlesOut = false;
let micStream = null;
let micRafId = null;

function lightCandles() {
  if (cakeLit) return;
  cakeLit = true;
  candlesOut = false;
  playSound('chime');
  cakeCandles.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.innerHTML = '<span class="flame">🔥</span>';
    cakeCandles.appendChild(candle);
  }
  cakeHint.textContent = 'Tap again to blow them out — or use the mic below.';
  micBtn.classList.remove('hidden');
}

function blowOutCandles() {
  if (!cakeLit || candlesOut) return;
  candlesOut = true;
  cakeCandles.querySelectorAll('.flame').forEach((f) => f.remove());
  playSound('blow');
  if (window.confetti) {
    window.confetti({ particleCount: 90, spread: 100, origin: { y: 0.55 } });
  }
  cakeHint.textContent = '🎉 Wish granted!';
  micBtn.classList.add('hidden');
  cleanupMic();
}

cake.addEventListener('click', () => {
  if (!cakeLit) lightCandles();
  else blowOutCandles();
});

async function enableMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStream = stream;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    micBtn.textContent = '🎙️ Listening... blow!';

    function check() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 45 && cakeLit && !candlesOut) {
        blowOutCandles();
        ctx.close();
        return;
      }
      micRafId = requestAnimationFrame(check);
    }
    check();
  } catch (e) {
    micBtn.textContent = '🎙️ Mic unavailable — tap the cake instead';
  }
}

function cleanupMic() {
  if (micRafId) cancelAnimationFrame(micRafId);
  if (micStream) micStream.getTracks().forEach((t) => t.stop());
  micStream = null;
}

micBtn.addEventListener('click', enableMic);

// ---------------------------------------------------------------
// Easter eggs: moon (night mode), typing HAPPY, shooting stars
// ---------------------------------------------------------------
let night = false;
moonBtn.addEventListener('click', () => {
  night = !night;
  appRoot.classList.toggle('night', night);
});

let typedBuffer = '';
window.addEventListener('keydown', (e) => {
  if (e.key.length !== 1) return;
  typedBuffer = (typedBuffer + e.key).slice(-5).toUpperCase();
  if (typedBuffer === 'HAPPY') {
    triggerSecret();
    typedBuffer = '';
  }
});

function triggerSecret() {
  playSound('chime');
  secretOverlay.classList.remove('hidden');
  setTimeout(() => secretOverlay.classList.add('hidden'), 2600);
}

// ---------------------------------------------------------------
// Mute toggle
// ---------------------------------------------------------------

musicToggle.addEventListener('click', () => {
  if (bgAudio.paused) {
    bgAudio.play().catch(() => {
      musicLabel.textContent = 'no track found';
    });
    musicToggle.classList.add('playing');
    musicToggle.setAttribute('aria-pressed', 'true');
    musicLabel.textContent = 'playing';
  } else {
    bgAudio.pause();
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-pressed', 'false');
    musicLabel.textContent = 'play music';
  }
});

muteBtn.addEventListener('click', () => {
  const next = !isMuted();
  setMuted(next);
  muteBtn.setAttribute('aria-pressed', String(!next));
  const icon = next ? '🔇' : isMusicPlaying() ? '🔊' : '🔈';
  muteBtn.innerHTML = `${icon} <span>${next ? 'unmute' : 'mute'}</span>`;

  if (next) {
    bgAudio.pause();
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-pressed', 'false');
    musicLabel.textContent = 'play music';
  }
});
// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
initFireworks(fireworksCanvas);
spawnParticles(['snow', 'star', 'heart'], 30);
buildGifts();
goToScene('scene-select');
