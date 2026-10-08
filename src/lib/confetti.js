// High performance canvas confetti & emoji burst - auto cleanup, zero dependencies
export function fireConfetti(options = {}) {
  if (typeof window === 'undefined') return;

  const count = options.count || 40;
  const emojis = options.emojis || null;
  const originY = options.y !== undefined ? options.y : 0.5;
  const originX = options.x !== undefined ? options.x : 0.5;

  let canvas = document.getElementById('xb-confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'xb-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#000000', '#3b82f6', '#ec4899', '#eab308', '#22c55e', '#a855f7'];

  const particles = [];
  const startX = width * originX;
  const startY = height * originY;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 12;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: emojis ? 20 + Math.random() * 10 : 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: emojis ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1,
      decay: 0.015 + Math.random() * 0.02,
      gravity: 0.25
    });
  }

  let animId = null;

  function render() {
    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0) continue;

      activeCount++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);

      if (p.emoji) {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    if (activeCount > 0) {
      animId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, width, height);
      if (animId) cancelAnimationFrame(animId);
    }
  }

  render();
}
