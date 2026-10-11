/**
 * NOOR - BEYOND SCENT
 * Master Application Coordinator
 */

import { PERFUMES_DATA, FOUR_HERITAGE_WORLDS } from './perfumes-data.js?v=10';
import { audioEngine } from './audio-engine.js';
import { FragranceSilkCanvas } from './canvas-trails.js';
import { NoorCursor } from './cursor.js';
import { SeeYourScentGenerator } from './see-your-scent.js';
import { NoorDiscoveryBag } from './bag.js';
import { initUnboxingVideos } from './unboxing-videos.js?v=11';

class NoorApp {
  constructor() {
    this.perfumes = PERFUMES_DATA;
    this.heritageWorlds = FOUR_HERITAGE_WORLDS;
    this.activeFilter = 'all';
    this.selectedPerfume = null;
    this.selectedSize = '100ml Flacon';

    this.bag = null;
    this.cursor = null;
    this.seeYourScent = null;
    this.heroCanvas = null;
    this.waveCanvas = null;
    this.unboxingVideos = null;
    this.sprayInterval = null;

    this.init();
  }

  init() {
    // Expose openProductModal globally
    window.openProductModal = (id) => this.openProductModal(id);

    // 1. Initialize custom cursor & bag
    this.cursor = new NoorCursor();
    this.bag = new NoorDiscoveryBag();
    this.seeYourScent = new SeeYourScentGenerator();
    this.unboxingVideos = initUnboxingVideos();

    // 2. Initialize canvases
    this.heroCanvas = new FragranceSilkCanvas('hero-fragrance-canvas', { mode: 'hero', particleCount: 40 });
    this.waveCanvas = new FragranceSilkCanvas('see-smell-canvas', { mode: 'wave', particleCount: 22 });

    // 3. Entrance sequence
    this.setupEntranceSequence();

    // 4. Navigation scroll observer
    this.setupNavigation();

    // 5. Automatic 3D Perfume Bottle Mist Spray
    this.setupMasterHeroCover();

    // 6. Render dynamic sections
    this.setupFourWorldsDiscovery();
    this.renderHeritageWorlds();
    this.renderPerfumeGallery();
    this.setupInvisibleProgression();
    this.setupScentGallery();

    // 7. Product Detail Modal
    this.setupProductDetailModal();

    // 8. Audio Controls
    this.setupAudioControls();

    // 9. Scroll-triggered reveals
    this.setupScrollReveals();
  }

  setupEntranceSequence() {
    const overlay = document.getElementById('entrance-overlay');
    if (!overlay) return;

    setTimeout(() => {
      overlay.classList.add('completed');
    }, 2800);
  }

  setupNavigation() {
    const navbar = document.getElementById('noor-navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          const navLinks = document.getElementById('nav-links');
          if (navLinks) navLinks.classList.remove('mobile-open');
        }
      });
    });

    // Mobile nav
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }
  }

  setupAudioControls() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioLabel = document.getElementById('audio-state-label');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      const isPlaying = audioEngine.toggle();
      if (isPlaying) {
        audioBtn.classList.add('playing');
        if (audioLabel) audioLabel.textContent = 'SOUND: ON';
      } else {
        audioBtn.classList.remove('playing');
        if (audioLabel) audioLabel.textContent = 'SOUND: OFF';
      }
    });
  }

  /* Section 6: SEE -> READ -> IMAGINE sequenced highlight */
  setupInvisibleProgression() {
    const steps = [
      document.getElementById('sri-see'),
      document.getElementById('sri-read'),
      document.getElementById('sri-imagine')
    ];

    let currentStepIdx = 0;
    setInterval(() => {
      steps.forEach((s, idx) => {
        if (!s) return;
        if (idx === currentStepIdx) {
          s.classList.add('active', 'highlight');
        } else {
          s.classList.remove('active', 'highlight');
        }
      });
      currentStepIdx = (currentStepIdx + 1) % steps.length;
    }, 1800);
  }

  /* Section 7: Visual Language switcher */
  setupVisualLanguage() {
    const data = {
      COLOUR: {
        def: "Fragrance has frequency. Deep ambers reflect heavy resins; pale greens whisper crisp petrichor; white pigments evoke dawn jasmine blossoms.",
        colorAura: "radial-gradient(circle at 50% 50%, #B5965A 0%, #E6D8C6 60%, #F4EFE6 100%)",
        iconSvg: `<svg viewBox="0 0 100 100" class="vl-art-svg"><circle cx="50" cy="50" r="35" fill="none" stroke="#B5965A" stroke-width="1.5"/><circle cx="50" cy="50" r="22" fill="#B5965A" opacity="0.3"/></svg>`
      },
      TEXTURE: {
        def: "Before it is inhaled, a fragrance has physical grain: the damp crumb of Kannauj terracotta clay, the smooth oily sheen of aged sandalwood, or the soft nap of crimson velvet.",
        colorAura: "radial-gradient(circle at 50% 50%, #5A4635 0%, #2A211B 80%)",
        iconSvg: `<svg viewBox="0 0 100 100" class="vl-art-svg"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#D8C09A" stroke-width="1.5"/><line x1="25" y1="50" x2="75" y2="50" stroke="#D8C09A" stroke-width="0.8"/></svg>`
      },
      LIGHT: {
        def: "Scent travels like refracted sunlight through crystal. From the blinding white luminescence of morning mogra to the smoldering dark shadows of Kasturi musk.",
        colorAura: "radial-gradient(circle at 50% 50%, #FAF6EE 0%, #D8C09A 70%, #B5965A 100%)",
        iconSvg: `<svg viewBox="0 0 100 100" class="vl-art-svg"><line x1="50" y1="15" x2="50" y2="85" stroke="#B5965A" stroke-width="1"/><line x1="15" y1="50" x2="85" y2="50" stroke="#B5965A" stroke-width="1"/></svg>`
      },
      FORM: {
        def: "Fragrance is architecture in vapor form. An invisible geometric flacon sculpted in memory, holding curves of saffron, arches of cedar, and domes of amber.",
        colorAura: "radial-gradient(circle at 50% 50%, #3D2E22 0%, #1C1511 80%)",
        iconSvg: `<svg viewBox="0 0 100 100" class="vl-art-svg"><polygon points="50,15 85,75 15,75" fill="none" stroke="#D8C09A" stroke-width="1.2"/></svg>`
      },
      STORY: {
        def: "Every drop is an unwritten myth of the Indian subcontinent. The first monsoon showers over ancient brick, the silence of a Himalayan musk forest, or a royal courtyard at dusk.",
        colorAura: "radial-gradient(circle at 50% 50%, #4A5243 0%, #2A211B 90%)",
        iconSvg: `<svg viewBox="0 0 100 100" class="vl-art-svg"><circle cx="50" cy="50" r="30" fill="none" stroke="#D8C09A" stroke-width="1.2"/><path d="M50 20 L50 50 L70 50" fill="none" stroke="#D8C09A" stroke-width="1.2"/></svg>`
      }
    };

    const pills = document.querySelectorAll('.vl-nav-pill');
    const wordEl = document.getElementById('vl-word-title');
    const defEl = document.getElementById('vl-word-desc');
    const visualBox = document.getElementById('vl-visual-box');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const key = pill.getAttribute('data-word');
        const item = data[key];
        if (!item) return;

        if (wordEl) wordEl.textContent = key;
        if (defEl) defEl.textContent = item.def;
        if (visualBox) {
          visualBox.style.background = item.colorAura;
          visualBox.innerHTML = `<div class="vl-visual-inner">${item.iconSvg}</div>`;
        }
      });
    });
  }

  /* ==========================================================================
     HERO COVER MASTER EXPERIENCE
     Symmetrical 4-Worlds Portals (Mitti, Sandalwood, Mogra, Kasturi)
     Continuous Auto-Mist Physics, 3D Flacon Tilt, Chromatic Aura Shift & Web Audio
     ========================================================================== */
  setupMasterHeroCover() {
    const portals = document.querySelectorAll('.hero-quadrant-portal');
    const flaconCard = document.getElementById('hero-flacon-card');
    const flaconImg = document.getElementById('hero-flacon-image');
    const activeNum = document.getElementById('hero-active-num');
    const activeName = document.getElementById('hero-active-name');
    const activeAccord = document.getElementById('hero-active-accord');
    const ctaLabel = document.getElementById('hero-cta-label');
    const aura = document.getElementById('hero-ambient-aura');
    const pedestal = document.getElementById('hero-pedestal-glow');

    const worldData = {
      kasturi: {
        num: '01',
        name: 'MIDNIGHT MUSK',
        accord: 'SACRED KASTURI ATTAR',
        image: 'assets/images/NOOR_Perfume_01_bottle_only.png',
        aura: 'radial-gradient(circle, rgba(181, 150, 90, 0.45) 0%, rgba(138, 98, 43, 0.22) 50%, transparent 70%)',
        pedestal: 'radial-gradient(ellipse at 50% 50%, rgba(216, 192, 154, 0.8) 0%, rgba(181, 150, 90, 0.35) 50%, transparent 75%)',
        ctaText: 'EXPLORE KASTURI ATTAR'
      },
      mitti: {
        num: '02',
        name: 'RAIN WHISPER',
        accord: 'MONSOON MITTI ATTAR',
        image: 'assets/images/NOOR_Perfume_02_bottle_only.png',
        aura: 'radial-gradient(circle, rgba(74, 90, 67, 0.42) 0%, rgba(138, 122, 90, 0.18) 50%, transparent 70%)',
        pedestal: 'radial-gradient(ellipse at 50% 50%, rgba(140, 168, 130, 0.65) 0%, rgba(74, 90, 67, 0.28) 50%, transparent 75%)',
        ctaText: 'EXPLORE MITTI ATTAR'
      },
      sandalwood: {
        num: '03',
        name: 'SANDAL GLOW',
        accord: 'MYSORE CHANDAN ATTAR',
        image: 'assets/images/NOOR_Perfume_03_bottle_only.png',
        aura: 'radial-gradient(circle, rgba(216, 192, 154, 0.5) 0%, rgba(181, 140, 70, 0.24) 50%, transparent 70%)',
        pedestal: 'radial-gradient(ellipse at 50% 50%, rgba(240, 220, 180, 0.78) 0%, rgba(216, 192, 154, 0.35) 50%, transparent 75%)',
        ctaText: 'EXPLORE SANDALWOOD ATTAR'
      },
      mogra: {
        num: '04',
        name: 'WHITE PETAL',
        accord: 'ROYAL MOGRA JASMINE',
        image: 'assets/images/NOOR_Perfume_04_bottle_only.png',
        aura: 'radial-gradient(circle, rgba(236, 229, 218, 0.65) 0%, rgba(200, 190, 175, 0.25) 50%, transparent 70%)',
        pedestal: 'radial-gradient(ellipse at 50% 50%, rgba(250, 248, 243, 0.85) 0%, rgba(216, 192, 154, 0.3) 50%, transparent 75%)',
        ctaText: 'EXPLORE MOGRA JASMINE'
      }
    };

    let activeWorld = 'kasturi';

    const switchHeroWorld = (worldKey) => {
      const data = worldData[worldKey];
      if (!data) return;
      activeWorld = worldKey;

      portals.forEach(p => {
        if (p.getAttribute('data-world') === worldKey) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      if (flaconImg && flaconImg.getAttribute('src') !== data.image) {
        flaconImg.style.opacity = '0';
        flaconImg.style.transform = 'scale(0.96) translateY(4px)';
        setTimeout(() => {
          flaconImg.src = data.image;
          flaconImg.style.opacity = '1';
          flaconImg.style.transform = 'scale(1) translateY(0)';
        }, 220);
      }

      if (activeNum) activeNum.textContent = data.num;
      if (activeName) activeName.textContent = data.name;
      if (activeAccord) activeAccord.textContent = data.accord;
      if (ctaLabel) ctaLabel.textContent = data.ctaText;

      if (aura) aura.style.background = data.aura;
      if (pedestal) pedestal.style.background = data.pedestal;

      if (this.heroCanvas) {
        const rect = flaconCard ? flaconCard.getBoundingClientRect() : null;
        const sprayX = rect ? (rect.left + rect.width / 2) : (window.innerWidth * 0.5);
        const sprayY = rect ? (rect.top + rect.height * 0.25) : (window.innerHeight * 0.42);
        this.heroCanvas.triggerSpray(sprayX, sprayY);
      }

      audioEngine.setMode(worldKey);
    };

    portals.forEach(portal => {
      const worldKey = portal.getAttribute('data-world');
      portal.addEventListener('mouseenter', () => {
        switchHeroWorld(worldKey);
      });
      portal.addEventListener('click', (e) => {
        switchHeroWorld(worldKey);
        const target = document.querySelector('#heritage-quadrant');
        if (target && e.target.classList.contains('portal-link')) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // 3D Perspective Tilt on Mouse Movement over Hero Stage
    const heroSection = document.getElementById('hero-section');
    if (heroSection && flaconCard) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        flaconCard.style.transform = "perspective(1000px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg) translateZ(10px)";
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        flaconCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    }

    // Click on bottle to trigger instant atomized mist burst
    if (flaconCard) {
      flaconCard.addEventListener('click', () => {
        flaconCard.classList.remove('spraying');
        void flaconCard.offsetWidth; // trigger reflow
        flaconCard.classList.add('spraying');

        const rect = flaconCard.getBoundingClientRect();
        if (this.heroCanvas) {
          this.heroCanvas.triggerSpray(rect.left + rect.width / 2, rect.top + rect.height * 0.22);
        }
        audioEngine.playNote('spray');
      });
    }

    // Automatic ambient mist spray burst on entrance
    setTimeout(() => {
      if (this.heroCanvas && flaconCard) {
        const rect = flaconCard.getBoundingClientRect();
        this.heroCanvas.triggerSpray(rect.left + rect.width / 2, rect.top + rect.height * 0.22);
      }
    }, 3200);

    // Continuous automatic subtle perfume mist every 6.5 seconds
    if (this.sprayInterval) clearInterval(this.sprayInterval);
    this.sprayInterval = setInterval(() => {
      if (this.heroCanvas && flaconCard && window.scrollY < window.innerHeight * 0.8) {
        const rect = flaconCard.getBoundingClientRect();
        this.heroCanvas.triggerSpray(rect.left + rect.width / 2, rect.top + rect.height * 0.22);
      }
    }, 6500);
  }

  /* Four Fragrance Worlds — One NOOR Discovery Handler */
  setupFourWorldsDiscovery() {
    const cards = document.querySelectorAll('.four-world-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const perfumeId = card.getAttribute('data-perfume-id');
        if (perfumeId) {
          this.openProductModal(perfumeId);
        }
      });
    });
  }

  /* Section 9-13: Render Heritage Quadrant */
  renderHeritageWorlds() {
    const slider = document.getElementById('worlds-horizontal-slider');
    if (!slider) return;

    slider.innerHTML = this.heritageWorlds.map(w => `
      <div class="world-scene-card" data-world-id="${w.id}">
        <div class="world-scene-grid">
          <div class="world-image-col" data-cursor="EXPLORE ${w.descriptors[0]}">
            <img src="${w.image}" alt="${w.title} · ${w.perfumeName}">
            <canvas class="world-canvas-overlay" id="canvas-world-${w.id}"></canvas>
          </div>
          <div class="world-meta-col">
            <span class="world-number-tag">${w.perfumeId} · THE HERITAGE QUADRANT</span>
            <h3 class="world-perfume-name">${w.title}</h3>
            <span class="world-perfume-subname">${w.perfumeName} · EAU DE PARFUM</span>
            <div class="world-keywords-row">
              ${w.descriptors.map(d => `<span class="keyword-badge">${d}</span>`).join('')}
            </div>
            <p class="world-narrative-text">${w.narrative}</p>
            <div class="world-action-row">
              <button class="noor-btn gold-line clickable" data-action="open-perfume" data-perfume-id="${w.perfumeId}">
                <span>DISCOVER ${w.title.replace(' ATTAR', '')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach card clicks & sound mode shifts on hover
    slider.querySelectorAll('.world-scene-card').forEach(card => {
      const worldId = card.getAttribute('data-world-id');
      card.addEventListener('mouseenter', () => {
        audioEngine.setMode(worldId);
      });

      card.querySelectorAll('[data-action="open-perfume"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-perfume-id');
          this.openProductModal(id);
        });
      });
    });

    // Wire up slider navigation buttons and counter
    const prevBtn = document.getElementById('worlds-prev-btn');
    const nextBtn = document.getElementById('worlds-next-btn');
    const counterEl = document.getElementById('worlds-current-idx');

    const updateCounter = () => {
      if (!counterEl) return;
      const cards = slider.querySelectorAll('.world-scene-card');
      if (!cards.length) return;
      const scrollLeft = slider.scrollLeft;
      const cardWidth = cards[0].offsetWidth;
      const activeIdx = Math.min(cards.length - 1, Math.max(0, Math.round(scrollLeft / (cardWidth + 24))));
      counterEl.textContent = String(activeIdx + 1).padStart(2, '0');
    };

    slider.addEventListener('scroll', updateCounter, { passive: true });

    if (prevBtn) {
      prevBtn.onclick = () => {
        const card = slider.querySelector('.world-scene-card');
        const shift = card ? card.offsetWidth + 32 : 600;
        slider.scrollBy({ left: -shift, behavior: 'smooth' });
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        const card = slider.querySelector('.world-scene-card');
        const shift = card ? card.offsetWidth + 32 : 600;
        slider.scrollBy({ left: shift, behavior: 'smooth' });
      };
    }
  }

  /* Section 14: Render 20-Perfume Asymmetric Gallery (100% Text Visible) */
  renderPerfumeGallery() {
    const gallery = document.getElementById('perfumes-masonry-gallery');
    if (!gallery) return;

    // Filter perfumes
    let filtered = this.perfumes;
    if (this.activeFilter !== 'all') {
      filtered = this.perfumes.filter(p => p.category.toLowerCase().includes(this.activeFilter.toLowerCase()));
    }

    gallery.innerHTML = filtered.map((p, idx) => {
      // Assign editorial layout classes
      let layoutClass = '';
      if (idx === 0 || idx === 7 || idx === 15) layoutClass = 'featured-two-cols';

      return `
        <article class="perfume-card ${layoutClass}" data-perfume-id="${p.id}" data-cursor="SMELL">
          <div class="perfume-card-img-wrap">
            <img src="${p.image}" alt="${p.number} ${p.name}" loading="lazy">
          </div>
          <div class="perfume-card-body">
            <div class="perfume-card-header-badge-row">
              <span class="perfume-card-edition-badge">EDP · 100ML</span>
              <span class="perfume-card-family-tag">${p.category}</span>
            </div>
            <h4 class="perfume-card-title">${p.number} ${p.name}</h4>
            <div class="perfume-card-characteristics">${p.subtitle}</div>
            <p class="perfume-card-quote">“${p.quote}”</p>
            <div class="perfume-card-footer">
              <span class="perfume-card-price">₹${p.price.toLocaleString('en-IN')}</span>
              <span class="perfume-card-link-text">
                SMELL THE STORY
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click triggers to open PDP
    gallery.querySelectorAll('.perfume-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-perfume-id');
        this.openProductModal(id);
      });
    });

    // Filter buttons
    document.querySelectorAll('.collection-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.collection-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter') || 'all';
        this.renderPerfumeGallery();
      });
    });
  }

  /* Section 15: Product Detail Experience (Modal/Stage) */
  setupProductDetailModal() {
    const backdrop = document.getElementById('pdp-modal-backdrop');
    const shell = document.getElementById('pdp-modal-shell');
    const closeBtn = document.getElementById('pdp-close-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeProductModal());
    if (backdrop) backdrop.addEventListener('click', () => this.closeProductModal());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeProductModal();
    });

    window.addEventListener('noor:open-perfume', (e) => {
      this.openProductModal(e.detail.id);
    });

    // Hero trigger
    const heroExploreBtn = document.getElementById('hero-explore-btn');
    if (heroExploreBtn) {
      heroExploreBtn.addEventListener('click', () => this.openProductModal('01'));
    }
  }

  openProductModal(perfumeId) {
    const perfume = this.perfumes.find(p => p.id === perfumeId) || this.perfumes[0];
    this.selectedPerfume = perfume;
    this.selectedSize = '100ml Flacon';

    const backdrop = document.getElementById('pdp-modal-backdrop');
    const shell = document.getElementById('pdp-modal-shell');
    const layout = document.getElementById('pdp-modal-layout');

    if (!backdrop || !shell || !layout) return;

    // Shift audio to perfume world if matched
    if (perfume.heritageWorld) {
      audioEngine.setMode(perfume.heritageWorld);
    }

    layout.innerHTML = `
      <div class="pdp-visual-stage" style="background: radial-gradient(circle at 50% 50%, ${perfume.visualMood.aura} 0%, #1C1511 80%);">
        <img src="${perfume.image}" alt="${perfume.name}" class="pdp-hero-image">
      </div>
      <div class="pdp-content-stage">
        <div class="pdp-header-meta">
          <div class="pdp-number">${perfume.number} · ${perfume.category.toUpperCase()}</div>
          <h2 class="pdp-title">${perfume.name}</h2>
          <div class="pdp-character">${perfume.subtitle}</div>
        </div>

        <p class="pdp-story-quote">“${perfume.quote}”</p>
        <p class="pdp-full-narrative">${perfume.story}</p>

        <div class="pdp-pyramid-block">
          <div class="pdp-pyramid-title">Olfactory Architecture</div>
          <div class="pyramid-tier">
            <span class="tier-label">TOP NOTES</span>
            <span class="tier-notes">${perfume.topNotes.join(' · ')}</span>
          </div>
          <div class="pyramid-tier">
            <span class="tier-label">HEART NOTES</span>
            <span class="tier-notes">${perfume.heartNotes.join(' · ')}</span>
          </div>
          <div class="pyramid-tier">
            <span class="tier-label">BASE NOTES</span>
            <span class="tier-notes">${perfume.baseNotes.join(' · ')}</span>
          </div>
        </div>

        <div class="pdp-size-selector">
          <button class="pdp-size-btn active" id="btn-size-100" data-size="100ml Flacon" data-price="${perfume.price}">
            <span class="size-label">100ML FLACON</span>
            <span class="size-price">₹${perfume.price.toLocaleString('en-IN')}</span>
          </button>
          <button class="pdp-size-btn" id="btn-size-15" data-size="15ml Discovery" data-price="${perfume.discoveryPrice}">
            <span class="size-label">15ML DISCOVERY</span>
            <span class="size-price">₹${perfume.discoveryPrice.toLocaleString('en-IN')}</span>
          </button>
        </div>

        <div class="pdp-action-footer">
          <button class="noor-btn gold-line clickable" id="pdp-add-bag-btn">
            <span>INVITE TO DISCOVERY BAG</span>
          </button>
          <button class="noor-btn outline clickable" id="pdp-smell-story-btn">
            <span>SMELL THE STORY</span>
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('open');
    shell.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Size selection
    const sizeBtns = layout.querySelectorAll('.pdp-size-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSize = btn.getAttribute('data-size');
      });
    });

    // Add to bag
    const addBagBtn = layout.querySelector('#pdp-add-bag-btn');
    if (addBagBtn) {
      addBagBtn.addEventListener('click', () => {
        const isDiscovery = this.selectedSize.includes('15ml');
        const price = isDiscovery ? perfume.discoveryPrice : perfume.price;

        window.dispatchEvent(new CustomEvent('noor:add-to-bag', {
          detail: {
            id: perfume.id,
            name: perfume.name,
            number: perfume.number,
            size: this.selectedSize,
            price: price,
            image: perfume.image
          }
        }));

        this.closeProductModal();
      });
    }

    // Smell the story interactive pulse
    const smellStoryBtn = layout.querySelector('#pdp-smell-story-btn');
    if (smellStoryBtn) {
      smellStoryBtn.addEventListener('click', () => {
        const img = layout.querySelector('.pdp-hero-image');
        if (img) {
          img.style.filter = 'brightness(1.2) drop-shadow(0 0 40px rgba(216, 192, 154, 0.6))';
          setTimeout(() => {
            img.style.filter = '';
          }, 1500);
        }
      });
    }
  }

  closeProductModal() {
    const backdrop = document.getElementById('pdp-modal-backdrop');
    const shell = document.getElementById('pdp-modal-shell');
    if (backdrop) backdrop.classList.remove('open');
    if (shell) shell.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* Section 18: Virtual Scent Gallery */
  setupScentGallery() {
    const btns = document.querySelectorAll('.gallery-nav-btn');
    if (!btns || btns.length === 0) return;

    const galleryItems = [
      { id: 'kasturi', name: 'KASTURI ATTAR', img: 'assets/images/approved_perfume_01_midnight_musk.jpg', num: '01', desc: 'Ancient dark amber suspended in midnight mountain mist.' },
      { id: 'mitti', name: 'MITTI ATTAR', img: 'assets/images/approved_perfume_02_rain_whisper.jpg', num: '02', desc: 'The scent of baked Indian soil welcoming torrential monsoon rain.' },
      { id: 'sandalwood', name: 'MYSORE SANDALWOOD', img: 'assets/images/approved_perfume_03_sandal_glow.jpg', num: '03', desc: 'Warm Santalum heartwood bathed in sanctum lamp light.' },
      { id: 'mogra', name: 'MOGRA ATTAR', img: 'assets/images/approved_perfume_04_white_petal.jpg', num: '04', desc: 'White Arabian jasmine blossoms exhaling their secret beneath silver moon.' }
    ];
    const imgEl = document.getElementById('gallery-showcase-img');
    const nameEl = document.getElementById('gallery-perfume-name');
    const numEl = document.getElementById('gallery-perfume-num');
    const descEl = document.getElementById('gallery-perfume-desc');
    const exploreBtn = document.getElementById('gallery-explore-action');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const worldId = btn.getAttribute('data-gallery-world');
        const item = galleryItems.find(g => g.id === worldId) || galleryItems[0];

        if (imgEl) {
          imgEl.style.opacity = '0';
          setTimeout(() => {
            imgEl.src = item.img;
            imgEl.style.opacity = '1';
          }, 350);
        }

        if (nameEl) nameEl.textContent = item.name;
        if (numEl) numEl.textContent = `${item.num} · VIRTUAL INSTALLATION`;
        if (descEl) descEl.textContent = item.desc;
        if (exploreBtn) exploreBtn.setAttribute('data-perfume-id', item.num);

        audioEngine.setMode(worldId);
      });
    });

    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        const id = exploreBtn.getAttribute('data-perfume-id') || '01';
        this.openProductModal(id);
      });
    }
  }

  /* Scroll-triggered reveals */
  setupScrollReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Split words in CAN YOU SEE A SMELL
          const words = entry.target.querySelectorAll('.split-reveal-word');
          words.forEach((w, idx) => {
            setTimeout(() => {
              w.classList.add('visible');
            }, idx * 450);
          });
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.noorApp = new NoorApp();
});
