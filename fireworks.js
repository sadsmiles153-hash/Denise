// ---------------------------------------------------------------
// Lightweight canvas fireworks. start() begins spawning bursts,
// stop() halts spawning (existing particles finish fading out).
// ---------------------------------------------------------------

const COLORS = ['#ff9fc7', '#c8a2ff', '#7ec8e3', '#fff2b2', '#ffffff'];

let canvas, ctx, raf, spawnTimer;
let particles = [];
let running = false;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function spawnBurst() {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height * 0.5 + 40;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const count = 26;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 2.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
    });
  }
}

function tick() {
  if (!running && particles.length === 0) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 0.014;
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  particles = particles.filter((p) => p.life > 0);
  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(tick);
}

function initFireworks(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function startFireworks({ duration = null, interval = 450 } = {}) {
  if (running) return;
  running = true;
  spawnBurst();
  spawnTimer = setInterval(spawnBurst, interval);
  tick();
  if (duration) {
    setTimeout(stopFireworks, duration);
  }
}

function stopFireworks() {
  running = false;
  clearInterval(spawnTimer);
}
