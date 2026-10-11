/**
 * NOOR - BEYOND SCENT
 * Visual Language Interactive Museum Exhibition
 * Dynamic Pigment Chromatography, Tactile Materials, and Prismatic Caustics
 */

export class VisualLanguageExhibition {
  constructor() {
    this.container = document.getElementById('vl-stage-display');
    this.navPills = document.querySelectorAll('.vl-nav-pill');
    this.currentMode = 'COLOUR';
    this.canvasAnimId = null;

    this.init();
  }

  init() {
    this.navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.navPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentMode = pill.getAttribute('data-word') || 'COLOUR';
        this.render();
      });
    });

    this.render();
  }

  render() {
    if (this.canvasAnimId) {
      cancelAnimationFrame(this.canvasAnimId);
      this.canvasAnimId = null;
    }

    if (this.currentMode === 'COLOUR') {
      this.renderColourExhibit();
    } else if (this.currentMode === 'TEXTURE') {
      this.renderTextureExhibit();
    } else if (this.currentMode === 'LIGHT') {
      this.renderLightExhibit();
    } else if (this.currentMode === 'FORM') {
      this.renderFormExhibit();
    } else if (this.currentMode === 'STORY') {
      this.renderStoryExhibit();
    }
  }

  /* 1. COLOUR: Liquid Pigment Chromatography & Scent Dispersion */
  renderColourExhibit() {
    const pigments = [
      { name: "Pampore Saffron", hex: "#E28B38", note: "Volatile Solar Heat", scent: "Wild Saffron, Cardamom, Honey" },
      { name: "Monsoon Terracotta", hex: "#9E5A3C", note: "Mineral Rain Geosmin", scent: "Baked Clay, Wet Earth, River Stone" },
      { name: "Mysore Gold", hex: "#D4AF37", note: "Sacred Creamy Warmth", scent: "Heartwood Santal, Almond Milk" },
      { name: "Moonlit Mogra", hex: "#F3EDE2", note: "Ethereal Luminescence", scent: "Arabian Jasmine, Dewdrops, Neroli" },
      { name: "Damascus Crimson", hex: "#7D2034", note: "Opulent Velveteen Floral", scent: "Centifolia Rose, Saffron, Labdanum" },
      { name: "Nocturne Musk", hex: "#221A15", note: "Deep Smoked Shadow", scent: "Smoked Kasturi, Birch Tar, Aged Amber" }
    ];

    this.container.innerHTML = `
      <div class="vl-exhibit-grid">
        <div class="vl-canvas-column">
          <canvas id="vl-fluid-canvas" class="vl-interactive-canvas"></canvas>
          <div class="vl-canvas-hint">
            <span class="hint-pulse"></span>
            <span>Click any pigment vial to release fluid scent chromatography</span>
          </div>
        </div>

        <div class="vl-content-column">
          <span class="vl-sub-tag">01 · CHROMATIC DECODING</span>
          <h3 class="vl-exhibit-title">COLOUR</h3>
          <p class="vl-exhibit-lead">
            Every fragrance vibrates at an exact visual frequency. Before the aroma touches the nasal receptors, your mind's eye already registers its hue.
          </p>

          <div class="vl-pigment-palette">
            ${pigments.map((p, idx) => `
              <button class="vl-pigment-vial ${idx === 0 ? 'selected' : ''}" data-color="${p.hex}" data-name="${p.name}" data-scent="${p.scent}">
                <span class="vial-drop" style="background: ${p.hex}; box-shadow: 0 0 15px ${p.hex}88;"></span>
                <div class="vial-text">
                  <span class="vial-title">${p.name}</span>
                  <span class="vial-note">${p.note}</span>
                </div>
              </button>
            `).join('')}
          </div>

          <div class="vl-active-scent-bar" id="vl-color-scent-bar">
            <span class="scent-bar-label">CORRESPONDING NOTES:</span>
            <span class="scent-bar-val" id="vl-scent-notes-val">${pigments[0].scent}</span>
          </div>
        </div>
      </div>
    `;

    this.initFluidCanvas(pigments[0].hex);

    // Vial click handlers
    this.container.querySelectorAll('.vl-pigment-vial').forEach(vial => {
      vial.addEventListener('click', () => {
        this.container.querySelectorAll('.vl-pigment-vial').forEach(v => v.classList.remove('selected'));
        vial.classList.add('selected');
        const hex = vial.getAttribute('data-color');
        const scent = vial.getAttribute('data-scent');
        const scentEl = document.getElementById('vl-scent-notes-val');
        if (scentEl) scentEl.textContent = scent;
        this.bloomColor(hex);
      });
    });
  }

  initFluidCanvas(initialHex) {
    const canvas = document.getElementById('vl-fluid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = (rect.width || 480) * dpr;
    canvas.height = (rect.height || 420) * dpr;
    ctx.scale(dpr, dpr);

    const blobs = [];
    this.fluidBlobs = blobs;
    this.fluidCtx = ctx;
    this.fluidWidth = rect.width || 480;
    this.fluidHeight = rect.height || 420;

    this.bloomColor(initialHex);

    const animate = () => {
      ctx.fillStyle = 'rgba(244, 239, 230, 0.08)';
      ctx.fillRect(0, 0, this.fluidWidth, this.fluidHeight);

      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i];
        b.x += b.vx;
        b.y += b.vy;
        b.radius += b.growSpeed;
        b.alpha -= b.decay;

        if (b.alpha <= 0.01) {
          blobs.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.1, b.x, b.y, b.radius);
        grad.addColorStop(0, b.color.replace(')', `, ${b.alpha})`).replace('rgb', 'rgba'));
        grad.addColorStop(0.5, b.color.replace(')', `, ${b.alpha * 0.6})`).replace('rgb', 'rgba'));
        grad.addColorStop(1, b.color.replace(')', ', 0)').replace('rgb', 'rgba'));
        ctx.fillStyle = grad;
        ctx.filter = 'blur(16px)';
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      this.canvasAnimId = requestAnimationFrame(animate);
    };

    animate();
  }

  bloomColor(hex) {
    if (!this.fluidBlobs) return;
    const w = this.fluidWidth;
    const h = this.fluidHeight;
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Convert hex to rgb
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const rgbStr = `rgb(${r}, ${g}, ${b})`;

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.4;
      this.fluidBlobs.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 40 + 20,
        growSpeed: Math.random() * 0.8 + 0.3,
        alpha: Math.random() * 0.45 + 0.35,
        decay: 0.0035,
        color: rgbStr
      });
    }
  }

  /* 2. TEXTURE: Tactile High-Resolution Material Cards */
  renderTextureExhibit() {
    const textures = [
      {
        title: "Sun-Baked Kannauj Clay",
        fragrance: "02 RAIN WHISPER (Mitti Attar)",
        desc: "Porous, mineral, sun-fired earthenware drinking the first torrential droplets of monsoon showers. Fragrance as the cooling touch of drenched red soil.",
        tactileTag: "MINERAL · EARTHY · CRUMBLED",
        accent: "#9E5A3C",
        bgPattern: "radial-gradient(circle at 30% 40%, rgba(158, 90, 60, 0.4) 0%, rgba(65, 76, 61, 0.9) 100%)"
      },
      {
        title: "Aged Mysore Santalum Heartwood",
        fragrance: "03 SANDAL GLOW (Mysore Sandalwood)",
        desc: "Dense, oily, perfectly smoothed golden timber from 50-year-old sustainable roots. Fragrance as warm, buttery temple timber bathed in twilight diya oil.",
        tactileTag: "CREAMY · POLISHED · DENSE",
        accent: "#D8C09A",
        bgPattern: "radial-gradient(circle at 60% 30%, rgba(216, 192, 154, 0.35) 0%, rgba(90, 70, 53, 0.95) 100%)"
      },
      {
        title: "Raw Mulberry Handspun Silk",
        fragrance: "13 WHITE MUSK",
        desc: "Weightless, fluid fibers dried under gentle Himalayan sun. Second-skin musk that whispers like cool silk sliding across warm skin.",
        tactileTag: "WEIGHTLESS · AIRY · COOLING",
        accent: "#F4EFE6",
        bgPattern: "radial-gradient(circle at 50% 50%, rgba(244, 239, 230, 0.5) 0%, rgba(181, 150, 90, 0.3) 100%)"
      },
      {
        title: "Velveteen Damask Rose Petals",
        fragrance: "05 VELVET BLOOM",
        desc: "Deep crimson rose petals with microscopic velvety hairs that hold morning nectar drops. Heavy, sumptuous, opulent tactile luxury.",
        tactileTag: "VELVETEEN · CRIMSON · MOIST",
        accent: "#7D2034",
        bgPattern: "radial-gradient(circle at 40% 60%, rgba(125, 32, 52, 0.45) 0%, rgba(42, 33, 27, 0.95) 100%)"
      }
    ];

    this.container.innerHTML = `
      <div class="vl-texture-container">
        <div class="vl-texture-header">
          <span class="vl-sub-tag">02 · TACTILE PERCEPTION</span>
          <h3 class="vl-exhibit-title">TEXTURE</h3>
          <p class="vl-exhibit-lead">
            Before it is smelled, a perfume has physical friction. Your fingertips anticipate the grain of raw sandalwood, the mineral porosity of terracotta, and the cooling weightlessness of silk.
          </p>
        </div>

        <div class="vl-texture-grid">
          ${textures.map(t => `
            <div class="vl-texture-card" style="background: ${t.bgPattern};">
              <div class="texture-card-inner">
                <span class="texture-tag" style="color: ${t.accent};">${t.tactileTag}</span>
                <h4 class="texture-title">${t.title}</h4>
                <div class="texture-perfume-link">${t.fragrance}</div>
                <p class="texture-desc">${t.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* 3. LIGHT: Prismatic Caustic Solar Refraction */
  renderLightExhibit() {
    this.container.innerHTML = `
      <div class="vl-exhibit-grid">
        <div class="vl-canvas-column" style="background: radial-gradient(circle at 50% 50%, rgba(216, 192, 154, 0.4) 0%, #1C1511 80%); display: flex; align-items: center; justify-content: center;">
          <div class="vl-crystal-flacon-light">
            <div class="caustic-ray ray-1"></div>
            <div class="caustic-ray ray-2"></div>
            <div class="caustic-ray ray-3"></div>
            <div class="flacon-glow-core"></div>
          </div>
        </div>

        <div class="vl-content-column">
          <span class="vl-sub-tag">03 · SOLAR INCIDENCE</span>
          <h3 class="vl-exhibit-title">LIGHT</h3>
          <p class="vl-exhibit-lead">
            Fragrance is liquid light held in suspension. From the blinding white dawn of 4 AM Mogra harvest to the smoldering dark shadows of Kasturi musk.
          </p>

          <div class="vl-time-tiers">
            <div class="time-tier-item">
              <span class="time-hour">04:00 AM · DAWN LUMINESCENCE</span>
              <p class="time-desc">White Arabian Jasmine sambac exhaling in cold starlight before sun evaporates delicate terpenes.</p>
            </div>
            <div class="time-tier-item">
              <span class="time-hour">12:00 PM · SOLAR RADIANCE</span>
              <p class="time-desc">Zesty Pomelo peel, bitter Neroli blossom, and warm golden amber vibrating at peak frequency.</p>
            </div>
            <div class="time-tier-item">
              <span class="time-hour">06:30 PM · DUSK PETRICHOR</span>
              <p class="time-desc">Monsoon raindrops falling on terracotta brick at twilight, releasing damp geosmin into cooling air.</p>
            </div>
            <div class="time-tier-item">
              <span class="time-hour">12:00 AM · NOCTURNE OBSIDIAN</span>
              <p class="time-desc">Smoked wild agarwood and dark botanical Kasturi musk wrapping into an intimate skin veil.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* 4. FORM: Olfactory Architecture in Vapor */
  renderFormExhibit() {
    this.container.innerHTML = `
      <div class="vl-form-container">
        <div class="vl-texture-header">
          <span class="vl-sub-tag">04 · MOLECULAR ARCHITECTURE</span>
          <h3 class="vl-exhibit-title">FORM</h3>
          <p class="vl-exhibit-lead">
            Fragrance is invisible geometry sculpted in three ascending dimensions of volatility.
          </p>
        </div>

        <div class="vl-architecture-grid">
          <div class="arch-card">
            <span class="arch-level">TIER 01 · THE APEX (TOP)</span>
            <h4 class="arch-name">THE VOLATILE SPIRE</h4>
            <span class="arch-timing">0 to 30 Minutes</span>
            <p class="arch-desc">Fast-moving lightweight molecules that ignite curiosity. Sparkling bergamot, wet river stone, pink pepper, and morning dew.</p>
          </div>
          <div class="arch-card active-arch">
            <span class="arch-level">TIER 02 · THE NAVE (HEART)</span>
            <h4 class="arch-name">THE EMOTIONAL CORE</h4>
            <span class="arch-timing">30 Minutes to 4 Hours</span>
            <p class="arch-desc">The resonant signature of the flacon. Distilled Kannauj baked earth, night-blooming jasmine, damask rose, and aged temple sandalwood.</p>
          </div>
          <div class="arch-card">
            <span class="arch-level">TIER 03 · THE FOUNDATION (BASE)</span>
            <h4 class="arch-name">THE ENDURING MEMORY</h4>
            <span class="arch-timing">4 to 24+ Hours</span>
            <p class="arch-desc">Heavy, grounding botanical resins that anchor to the skin. Smoked agarwood, vintage ambergris, dark patchouli, and bourbon vanilla.</p>
          </div>
        </div>
      </div>
    `;
  }

  /* 5. STORY: Indian Perfumery Terroirs */
  renderStoryExhibit() {
    this.container.innerHTML = `
      <div class="vl-story-container">
        <div class="vl-texture-header">
          <span class="vl-sub-tag">05 · LIVING TERROIR</span>
          <h3 class="vl-exhibit-title">STORY</h3>
          <p class="vl-exhibit-lead">
            Every drop is rooted in centuries-old artisanal geography of the Indian subcontinent.
          </p>
        </div>

        <div class="vl-terroir-grid">
          <div class="terroir-card">
            <span class="terroir-location">KANNAUJ, UTTAR PRADESH</span>
            <h4 class="terroir-name">The City of Scent & Clay Stills</h4>
            <p class="terroir-desc">Centuries of unbroken hydro-distillation in wood-fired copper degs, capturing the soul of summer rain into sandalwood receivers.</p>
          </div>
          <div class="terroir-card">
            <span class="terroir-location">MYSORE, KARNATAKA</span>
            <h4 class="terroir-name">The Sacred Santalum Sanctum</h4>
            <p class="terroir-desc">Slow-growing royal sandalwood trees yielding velvety, butter-smooth heartwood oil reserved for ceremonial devotion.</p>
          </div>
          <div class="terroir-card">
            <span class="terroir-location">PAMPORE, KASHMIR</span>
            <h4 class="terroir-name">The High Saffron Valleys</h4>
            <p class="terroir-desc">Hand-harvested crimson stigmas of Crocus sativus blooming beneath snow-capped Himalayan peaks.</p>
          </div>
        </div>
      </div>
    `;
  }
}
