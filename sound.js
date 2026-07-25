// ---------------------------------------------------------------
// Sound engine: every effect is synthesized live with the Web Audio
// API, so the app needs zero external audio files. Swap in real
// MP3s later by editing playSound()/startMusic() if you want.
// ---------------------------------------------------------------

let audioCtx = null;
let muted = false;
let musicTimer = null;
let musicPlaying = false;

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

function tone(ctx, { freq = 440, type = 'sine', start = 0, duration = 0.2, gain = 0.15, sweep = null }) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (sweep) osc.frequency.linearRampToValueAtTime(sweep, ctx.currentTime + start + duration);
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

function noiseBurst(ctx, { start = 0, duration = 0.3, gain = 0.1 }) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  src.connect(g);
  g.connect(ctx.destination);
  src.start(ctx.currentTime + start);
}

const EFFECTS = {
  click: (ctx) => tone(ctx, { freq: 700, type: 'sine', duration: 0.08, gain: 0.12 }),
  chirp: (ctx) => {
    tone(ctx, { freq: 900, sweep: 1400, type: 'sine', duration: 0.15, gain: 0.14 });
    tone(ctx, { freq: 1200, sweep: 700, type: 'sine', start: 0.12, duration: 0.12, gain: 0.1 });
  },
  gift: (ctx) => {
    tone(ctx, { freq: 300, sweep: 900, type: 'triangle', duration: 0.35, gain: 0.16 });
    noiseBurst(ctx, { start: 0.1, duration: 0.2, gain: 0.06 });
  },
  confetti: (ctx) => {
    for (let i = 0; i < 5; i++) {
      tone(ctx, { freq: 600 + i * 140, type: 'sine', start: i * 0.045, duration: 0.12, gain: 0.09 });
    }
  },
  firework: (ctx) => {
    noiseBurst(ctx, { start: 0, duration: 0.4, gain: 0.12 });
    tone(ctx, { freq: 220, sweep: 60, type: 'sawtooth', duration: 0.4, gain: 0.08 });
  },
  chime: (ctx) => {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone(ctx, { freq: f, type: 'sine', start: i * 0.1, duration: 0.5, gain: 0.1 })
    );
  },
  blow: (ctx) => noiseBurst(ctx, { start: 0, duration: 0.6, gain: 0.08 }),
};

function playSound(name) {
  if (muted) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    EFFECTS[name]?.(ctx);
  } catch (e) {
    // Fail silently if audio isn't available — never break the UI
  }
}

function setMuted(value) {
  muted = value;
  if (muted) stopMusic();
}

function isMuted() {
  return muted;
}

function startMusic() {
  if (muted || musicPlaying) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
  let step = 0;
  function playNote() {
    const freq = notes[step % notes.length];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
    step++;
  }
  playNote();
  musicTimer = setInterval(playNote, 550);
  musicPlaying = true;
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  musicPlaying = false;
}

function isMusicPlaying() {
  return musicPlaying;
}
