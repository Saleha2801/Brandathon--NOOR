/**
 * NOOR - BEYOND SCENT
 * Fragrance Silk & Scent Trail Canvas Physics
 * Renders translucent flowing silk, organic waves of light, and micro-particles
 * without generic smoke or harsh edges.
 */

export class FragranceSilkCanvas {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = Object.assign({
      mode: 'hero', // 'hero', 'wave', 'rain', 'particles', 'petals'
      color: 'rgba(216, 192, 154, 0.22)',
      glowColor: 'rgba(181, 150, 90, 0.15)',
      particleCount: 38,
      speed: 0.003
    }, options);

    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.particles = [];
    this.sprayParticles = [];
    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    this.animId = null;

    this.init();
  }

  // Trigger high-velocity golden perfume mist burst from flacon nozzle
  triggerSpray(originX, originY) {
    const ox = originX !== undefined ? originX : this.width * 0.5;
    const oy = originY !== undefined ? originY : this.height * 0.45;

    // Create 200 fine spray droplets and mist plumes
    for (let i = 0; i < 200; i++) {
      // Angle directed upwards and billowing outward organically
      const baseAngle = -Math.PI / 2;
      const spread = (Math.random() - 0.5) * 1.5;
      const angle = baseAngle + spread;
      const speed = Math.random() * 12 + 4;

      this.sprayParticles.push({
        x: ox + (Math.random() - 0.5) * 6,
        y: oy + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.2,
        alpha: Math.random() * 0.8 + 0.4,
        decay: Math.random() * 0.012 + 0.008,
        drag: 0.94, // Air resistance slows mist down
        gravity: 0.04, // Gentle downward drift after deceleration
        wobble: Math.random() * 10,
        colorType: Math.random() > 0.4 ? 'gold' : 'mist'
      });
    }
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX / window.innerWidth;
      this.mouse.targetY = e.clientY / window.innerHeight;
    }, { passive: true });

    this.createParticles();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.8 + 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.6 - 0.2,
        alpha: Math.random() * 0.5 + 0.15,
        targetAlpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        angle: Math.random() * Math.PI * 2,
        waveOffset: Math.random() * 100
      });
    }
  }

  setMode(mode, options = {}) {
    this.options.mode = mode;
    Object.assign(this.options, options);
    this.createParticles();
  }

  animate() {
    this.time += this.options.speed;
    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.options.mode === 'hero') {
      this.renderHeroSilk();
      this.renderFloatingParticles();
      this.renderSprayParticles();
    } else if (this.options.mode === 'wave' || this.options.mode === 'rain' || this.options.mode === 'petals') {
      this.renderWaveAura();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }

  // Render expanding golden mist cloud and atomized perfume droplets
  renderSprayParticles() {
    const ctx = this.ctx;
    for (let i = this.sprayParticles.length - 1; i >= 0; i--) {
      const p = this.sprayParticles[i];

      // Physics update
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.radius += 0.12; // Mist plume expands as it travels
      p.alpha -= p.decay;

      if (p.alpha <= 0.01) {
        this.sprayParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      if (p.colorType === 'gold') {
        grad.addColorStop(0, `rgba(235, 210, 160, ${p.alpha})`);
        grad.addColorStop(0.4, `rgba(181, 150, 90, ${p.alpha * 0.7})`);
        grad.addColorStop(1, 'rgba(181, 150, 90, 0)');
      } else {
        grad.addColorStop(0, `rgba(255, 252, 245, ${p.alpha * 0.9})`);
        grad.addColorStop(0.5, `rgba(225, 215, 195, ${p.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(244, 239, 230, 0)');
      }
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Hero: Translucent organic silk ribbons swaying around bottle
  renderHeroSilk() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w * (0.5 + (this.mouse.x - 0.5) * 0.08);
    const cy = h * (0.55 + (this.mouse.y - 0.5) * 0.08);

    const ribbons = [
      { yOffset: -60, amp: 45, freq: 0.002, color: 'rgba(216, 192, 154, 0.14)', blur: 18, width: 90 },
      { yOffset: 20, amp: 65, freq: 0.0028, color: 'rgba(181, 150, 90, 0.10)', blur: 24, width: 140 },
      { yOffset: 90, amp: 35, freq: 0.0018, color: 'rgba(230, 216, 198, 0.16)', blur: 14, width: 80 }
    ];

    ribbons.forEach((ribbon, rIdx) => {
      ctx.save();
      ctx.beginPath();
      
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.45);
      grad.addColorStop(0, ribbon.color);
      grad.addColorStop(0.6, 'rgba(216, 192, 154, 0.04)');
      grad.addColorStop(1, 'rgba(244, 239, 230, 0)');

      ctx.fillStyle = grad;

      // Draw flowing silk contour around center
      const points = 8;
      const baseR = Math.min(w, h) * 0.35 + ribbon.yOffset;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const wave = Math.sin(theta * 3 + this.time * 2 + rIdx) * ribbon.amp +
                     Math.cos(theta * 2 - this.time * 1.5) * 20;
        const r = baseR + wave;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * (r * 0.7);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.filter = `blur(${ribbon.blur}px)`;
      ctx.fill();
      ctx.restore();
    });
  }

  // Floating micro-particles of golden scent essence
  renderFloatingParticles() {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(this.time + p.waveOffset) * 0.4;
      p.alpha = 0.2 + Math.sin(this.time * 5 + p.waveOffset) * 0.18;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }

      ctx.save();
      ctx.beginPath();
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      grad.addColorStop(0, `rgba(216, 192, 154, ${p.alpha * 1.2})`);
      grad.addColorStop(0.5, `rgba(181, 150, 90, ${p.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(181, 150, 90, 0)');
      ctx.fillStyle = grad;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Subtle wave passing across "CAN YOU SEE A SMELL?"
  renderWaveAura() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);

    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.5 +
        Math.sin(x * 0.003 + this.time * 1.2) * 80 +
        Math.sin(x * 0.006 - this.time * 0.8) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, h * 0.3, 0, h);
    grad.addColorStop(0, 'rgba(216, 192, 154, 0.08)');
    grad.addColorStop(0.5, 'rgba(181, 150, 90, 0.04)');
    grad.addColorStop(1, 'rgba(244, 239, 230, 0)');

    ctx.fillStyle = grad;
    ctx.filter = 'blur(30px)';
    ctx.fill();
    ctx.restore();
  }

  // Rain droplets for Mitti
  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
