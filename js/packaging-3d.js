/**
 * NOOR — BEYOND SCENT
 * Interactive 3D Perfume Packaging Animation & Unboxing Controller
 * Sequence:
 *   Scene 1 — The Closed Box (Stone pedestal, light sweep over gold NOOR wordmark)
 *   Scene 2 — The Unboxing (Lid opens smoothly, velvet insert revealed, bottle lifts out)
 *   Scene 3 — The Bottle Reveal (3D rotation, highlights, silhouette, fragrance name & character)
 *   Scene 4 — Scent Visualisation (Abstract flowing translucent curves & particle aura)
 *   Scene 5 — Call to Action (“THE SCENT YOU CAN SEE”, “Discover the feeling behind every fragrance.”)
 * Works for all 20 Fragrances with approved packaging preservation.
 */

import { PERFUMES_DATA } from './perfumes-data.js';

class NoorPackaging3DController {
  constructor() {
    this.section = document.getElementById('packaging-unboxing-section');
    if (!this.section) return;

    this.activeId = "01";
    this.activePerfume = PERFUMES_DATA.find(p => p.id === "01") || PERFUMES_DATA[0];
    this.currentScene = 1;
    this.isPaused = false;
    this.animationTimer = null;
    this.sceneTimeouts = [];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Elements
    this.stageWrapper = document.getElementById('unboxing-stage-wrapper');
    this.scene3D = document.getElementById('unboxing-3d-scene');
    this.boxEntity = document.getElementById('unboxing-box-entity');
    this.boxImg = document.getElementById('unboxing-box-img');
    this.boxSheen = document.getElementById('unboxing-box-sheen');
    this.boxLid = document.getElementById('unboxing-box-lid');
    this.velvetInsert = document.getElementById('unboxing-velvet-insert');
    this.bottleEntity = document.getElementById('unboxing-bottle-entity');
    this.bottleImg = document.getElementById('unboxing-bottle-img');
    this.bottleGlow = document.getElementById('unboxing-bottle-glow');
    this.bottleShadow = document.getElementById('unboxing-bottle-shadow');
    this.badgeText = document.getElementById('unboxing-badge-text');
    this.canvas = document.getElementById('unboxing-scent-canvas');

    // Controls
    this.replayBtn = document.getElementById('unboxing-replay-btn');
    this.pauseBtn = document.getElementById('unboxing-pause-btn');
    this.pauseIcon = document.getElementById('unboxing-pause-icon');
    this.pauseLabel = document.getElementById('unboxing-pause-label');
    this.quickPills = document.querySelectorAll('#unboxing-quick-pills .unboxing-pill-btn');
    this.dropdown = document.getElementById('unboxing-perfume-dropdown');
    this.ctaBtn = document.getElementById('unboxing-cta-btn');

    // Editorial Card Elements
    this.cardNumber = document.getElementById('unboxing-card-number');
    this.cardFamily = document.getElementById('unboxing-card-family');
    this.cardTitle = document.getElementById('unboxing-card-title');
    this.cardSubtitle = document.getElementById('unboxing-card-subtitle');
    this.cardQuote = document.getElementById('unboxing-card-quote');
    this.cardStory = document.getElementById('unboxing-card-story');
    this.topNotesContainer = document.getElementById('unboxing-top-notes');
    this.heartNotesContainer = document.getElementById('unboxing-heart-notes');
    this.baseNotesContainer = document.getElementById('unboxing-base-notes');

    // 3D Mouse Parallax State
    this.isDragging = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentRotateX = 0;
    this.currentRotateY = 0;
    this.targetRotateX = 0;
    this.targetRotateY = 0;

    // Fluid Ribbon Canvas State
    this.ctx = null;
    this.particles = [];
    this.ribbonPoints = [];
    this.canvasAnimId = null;
    this.canvasVisible = false;

    this.init();
  }

  init() {
    this.populateDropdown();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.initScentCanvas();
    this.init3DMouseInteraction();
    this.updateEditorialCard(this.activePerfume);
  }

  populateDropdown() {
    if (!this.dropdown) return;
    this.dropdown.innerHTML = '<option value="" disabled>— Select Any of the 20 Fragrances —</option>';
    PERFUMES_DATA.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.number} — ${p.name} (${p.category})`;
      if (p.id === this.activeId) opt.selected = true;
      this.dropdown.appendChild(opt);
    });
  }

  setupEventListeners() {
    // Quick pills
    this.quickPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.dataset.perfumeId;
        if (id) this.switchFragrance(id);
      });
    });

    // Dropdown change
    if (this.dropdown) {
      this.dropdown.addEventListener('change', (e) => {
        if (e.target.value) this.switchFragrance(e.target.value);
      });
    }

    // Replay button
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.startCinematicSequence(true);
      });
    }

    // Pause button
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }

    // CTA Button — Wire to existing Product Detail Modal
    if (this.ctaBtn) {
      this.ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.openProductModal === 'function') {
          window.openProductModal(this.activeId);
        } else {
          const detailSection = document.getElementById('collection-section');
          if (detailSection) detailSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.hasStarted) {
            this.hasStarted = true;
            this.startCinematicSequence();
          }
          this.canvasVisible = true;
        } else {
          this.canvasVisible = false;
        }
      });
    }, { threshold: 0.25 });

    observer.observe(this.section);
  }

  switchFragrance(id) {
    const perfume = PERFUMES_DATA.find(p => p.id === id);
    if (!perfume) return;

    this.activeId = id;
    this.activePerfume = perfume;

    // Update Quick Pills active state
    this.quickPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.perfumeId === id);
    });

    // Update Dropdown
    if (this.dropdown) this.dropdown.value = id;

    // Update Editorial Info
    this.updateEditorialCard(perfume);

    // Update Approved Packaging Layer Assets
    this.updatePackagingAssets(perfume);

    // Update Canvas Colors
    this.updateScentCanvasColors(perfume);

    // Re-trigger Cinematic Unboxing Animation
    this.startCinematicSequence(true);
  }

  updatePackagingAssets(perfume) {
    const id = perfume.id;
    // Box Image
    if (this.boxImg) {
      const boxPath = `assets/images/packaging_layers/box_${id}.png`;
      this.boxImg.src = boxPath;
      this.boxImg.onerror = () => {
        this.boxImg.src = perfume.image;
      };
    }

    // Bottle Cutout
    if (this.bottleImg) {
      const cutoutPath = `assets/images/packaging_cutouts/bottle_cutout_${id}.png`;
      const layerFallback = `assets/images/packaging_layers/bottle_${id}.png`;
      this.bottleImg.src = cutoutPath;
      this.bottleImg.onerror = () => {
        this.bottleImg.src = layerFallback;
        this.bottleImg.onerror = () => {
          this.bottleImg.src = perfume.image;
        };
      };
    }

    // Bottle Glow
    if (this.bottleGlow && perfume.visualMood) {
      this.bottleGlow.style.background = `radial-gradient(circle, ${perfume.visualMood.aura || 'rgba(181, 150, 90, 0.35)'} 0%, transparent 70%)`;
    }
  }

  updateEditorialCard(perfume) {
    if (this.cardNumber) this.cardNumber.textContent = `${perfume.number} / 20`;
    if (this.cardFamily) this.cardFamily.textContent = perfume.family.toUpperCase();
    if (this.cardTitle) this.cardTitle.textContent = perfume.name;
    if (this.cardSubtitle) this.cardSubtitle.textContent = perfume.subtitle;
    if (this.cardQuote) this.cardQuote.textContent = `“${perfume.quote}”`;
    if (this.cardStory) this.cardStory.textContent = perfume.story;

    // Render Note Pills
    const renderPills = (container, notes) => {
      if (!container) return;
      container.innerHTML = '';
      (notes || []).forEach(note => {
        const span = document.createElement('span');
        span.className = 'note-pill';
        span.textContent = note;
        container.appendChild(span);
      });
    };

    renderPills(this.topNotesContainer, perfume.topNotes);
    renderPills(this.heartNotesContainer, perfume.heartNotes);
    renderPills(this.baseNotesContainer, perfume.baseNotes);

    // Update CTA button label
    if (this.ctaBtn) {
      const span = this.ctaBtn.querySelector('span');
      if (span) span.textContent = `DISCOVER ${perfume.name} →`;
    }
  }

  clearSceneTimeouts() {
    this.sceneTimeouts.forEach(t => clearTimeout(t));
    this.sceneTimeouts = [];
  }

  startCinematicSequence(force = false) {
    this.clearSceneTimeouts();

    if (this.reducedMotion) {
      // Reduced motion jumps directly to revealed state
      this.setScene(3);
      this.setScene(4);
      this.setScene(5);
      return;
    }

    // Reset classes to Scene 1
    this.setScene(1);

    // Sequence timing:
    // Scene 1: 0.0s - Closed box with light sweep on gold wordmark
    // Scene 2: 2.8s - Box lid hinges open, velvet interior revealed, bottle elevates upward
    // Scene 3: 5.8s - Bottle rotates into 3D spotlight, highlights glint, description focuses
    // Scene 4: 8.4s - Scent fluid contours flow around flacon
    // Scene 5: 11.2s - Final CTA presentation & interactive 3D inspection ready

    this.sceneTimeouts.push(setTimeout(() => {
      if (!this.isPaused) this.setScene(2);
    }, 2800));

    this.sceneTimeouts.push(setTimeout(() => {
      if (!this.isPaused) this.setScene(3);
    }, 5800));

    this.sceneTimeouts.push(setTimeout(() => {
      if (!this.isPaused) this.setScene(4);
    }, 8400));

    this.sceneTimeouts.push(setTimeout(() => {
      if (!this.isPaused) this.setScene(5);
    }, 11200));
  }

  setScene(sceneNum) {
    this.currentScene = sceneNum;
    if (!this.stageWrapper) return;

    // Update badge text
    if (this.badgeText) {
      switch (sceneNum) {
        case 1:
          this.badgeText.textContent = "SCENE 1: THE CLOSED BOX";
          break;
        case 2:
          this.badgeText.textContent = "SCENE 2: THE UNBOXING";
          break;
        case 3:
          this.badgeText.textContent = "SCENE 3: THE BOTTLE REVEAL";
          break;
        case 4:
          this.badgeText.textContent = "SCENE 4: SCENT VISUALISATION";
          break;
        case 5:
          this.badgeText.textContent = "THE SCENT YOU CAN SEE • 3D INSPECT";
          break;
      }
    }

    // Toggle CSS scene classes
    for (let s = 1; s <= 5; s++) {
      this.stageWrapper.classList.toggle(`in-scene-${s}`, s === sceneNum);
      if (s <= sceneNum) {
        this.stageWrapper.classList.add(`scene-${s}-reached`);
      } else {
        this.stageWrapper.classList.remove(`scene-${s}-reached`);
      }
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.pauseIcon) this.pauseIcon.textContent = this.isPaused ? "▶" : "⏸";
    if (this.pauseLabel) this.pauseLabel.textContent = this.isPaused ? "RESUME" : "PAUSE";
    if (this.stageWrapper) this.stageWrapper.classList.toggle('animation-paused', this.isPaused);
  }

  // =========================================================================
  // 3D MOUSE & TOUCH INTERACTION (DRAG & PARALLAX ROTATE)
  // =========================================================================
  init3DMouseInteraction() {
    if (!this.stageWrapper || !this.scene3D) return;

    const onPointerMove = (clientX, clientY) => {
      const rect = this.stageWrapper.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      // Restrained luxury 3D tilt angles (max +/- 18deg)
      this.targetRotateY = x * 26;
      this.targetRotateX = -y * 18;
    };

    this.stageWrapper.addEventListener('mousemove', (e) => {
      onPointerMove(e.clientX, e.clientY);
    });

    this.stageWrapper.addEventListener('mouseleave', () => {
      this.targetRotateX = 0;
      this.targetRotateY = 0;
    });

    // Touch support
    this.stageWrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.stageWrapper.addEventListener('touchend', () => {
      this.targetRotateX = 0;
      this.targetRotateY = 0;
    });

    // Render loop for smooth 3D damping
    const animate3D = () => {
      this.currentRotateX += (this.targetRotateX - this.currentRotateX) * 0.08;
      this.currentRotateY += (this.targetRotateY - this.currentRotateY) * 0.08;

      if (this.scene3D) {
        this.scene3D.style.transform = `rotateX(${this.currentRotateX.toFixed(2)}deg) rotateY(${this.currentRotateY.toFixed(2)}deg)`;
      }

      requestAnimationFrame(animate3D);
    };

    animate3D();
  }

  // =========================================================================
  // SCENT VISUALISATION CANVAS (SCENE 4: TRANSLUCENT FLUID RIBBONS & MIST)
  // =========================================================================
  initScentCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.initParticles();
    this.animateScentCanvas();
  }

  resizeCanvas() {
    if (!this.canvas || !this.stageWrapper) return;
    const rect = this.stageWrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) this.ctx.scale(dpr, dpr);
    this.canvasCSSWidth = rect.width;
    this.canvasCSSHeight = rect.height;
  }

  initParticles() {
    this.particles = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.canvasCSSWidth || 400),
        y: Math.random() * (this.canvasCSSHeight || 500),
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.7 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 120 + 60,
        orbitSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
      });
    }
  }

  updateScentCanvasColors(perfume) {
    this.canvasPrimaryColor = perfume.visualMood?.primaryColor || '#B5965A';
    this.canvasAccentColor = perfume.visualMood?.accentColor || '#D8C09A';
  }

  animateScentCanvas() {
    const draw = (timestamp) => {
      if (this.canvasVisible && this.ctx && this.currentScene >= 3) {
        const w = this.canvasCSSWidth || 400;
        const h = this.canvasCSSHeight || 500;
        this.ctx.clearRect(0, 0, w, h);

        const time = timestamp * 0.001;
        const centerX = w * 0.5;
        const centerY = h * 0.46;

        // Draw Translucent Abstract Flowing Ribbons (Scene 4)
        if (this.currentScene >= 4) {
          this.drawFlowingRibbon(centerX, centerY, time, 1);
          this.drawFlowingRibbon(centerX, centerY, time * 0.85, 2);
          this.drawFlowingRibbon(centerX, centerY, time * 1.15, 3);
        }

        // Draw Ambient Orbiting Luminous Particles
        const pColor = this.canvasAccentColor || '#D8C09A';
        this.ctx.fillStyle = pColor;

        this.particles.forEach(p => {
          p.orbitAngle += p.orbitSpeed;
          const px = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
          const py = centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.45) + Math.sin(time + p.orbitAngle) * 15;

          this.ctx.save();
          this.ctx.globalAlpha = p.alpha * (this.currentScene >= 4 ? 0.75 : 0.3);
          this.ctx.beginPath();
          this.ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = pColor;
          this.ctx.fill();
          this.ctx.restore();
        });
      }

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }

  drawFlowingRibbon(cx, cy, time, index) {
    const ctx = this.ctx;
    ctx.save();

    const color1 = this.canvasAccentColor || '#D8C09A';
    const grad = ctx.createLinearGradient(cx - 150, cy - 100, cx + 150, cy + 100);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.3, color1);
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(1, 'transparent');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6 + index * 0.6;
    ctx.globalAlpha = 0.38 + index * 0.08;
    ctx.beginPath();

    const points = 32;
    const radiusX = 110 + index * 24;
    const radiusY = 48 + index * 12;

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wave = Math.sin(angle * 3 + time * 1.5 + index) * 18;
      const x = cx + Math.cos(angle + time * 0.3) * (radiusX + wave);
      const y = cy + Math.sin(angle + time * 0.3) * (radiusY + wave) + Math.cos(time + index) * 8;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// Auto initialize on module load
let packagingControllerInstance = null;

export function initPackaging3D() {
  if (!packagingControllerInstance) {
    packagingControllerInstance = new NoorPackaging3DController();
  }
  return packagingControllerInstance;
}
