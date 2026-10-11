/**
 * NOOR — BEYOND SCENT
 * Scroll-Driven Unboxing Sequence Controller
 * Powered by GSAP + ScrollTrigger (Pinned stage through 500vh / 300vh mobile)
 *
 * Sequence Beats:
 *   Beat 1 (00% - 15%): Closed box
 *   Beat 2 (15% - 35%): Lid opens
 *   Beat 3 (35% - 55%): Correct bottle rises out of the box (Primary beat)
 *   Beat 4 (55% - 70%): Bottle rotates / closeup
 *   Beat 5 (70% - 85%): Bottle and matching box together
 *   Beat 6 (85% - 100%): Scent contours + real HTML name + scent description + CTA
 */

export const UNBOXING_FRAGRANCES = {
  '01': {
    id: '01',
    key: 'midnight-musk',
    name: 'MIDNIGHT MUSK',
    subtitle: 'Dark • Sensual • Mysterious',
    family: 'Oriental Amber Musk',
    accentColor: '#B5965A',
    description: 'Inspired by sacred Kasturi attar distilled under moonless Indian skies. Dark smoked resins, golden amber embers, and sensual botanical musk unfold in an intimate veil that warms to the skin over hours.',
    notes: {
      top: ['Black Cardamom', 'Smoked Bergamot', 'Wild Saffron'],
      heart: ['Sacred Kasturi Accord', 'Night Jasmine', 'Amber Resin'],
      base: ['Aged Oud', 'Dark Patchouli', 'Warm Benzoin']
    },
    frames: [
      'public/assets/noor/midnight-musk/frame-01.webp',
      'public/assets/noor/midnight-musk/frame-02.webp',
      'public/assets/noor/midnight-musk/frame-03.webp',
      'public/assets/noor/midnight-musk/frame-04.webp',
      'public/assets/noor/midnight-musk/frame-05.webp',
      'public/assets/noor/midnight-musk/frame-06.webp'
    ]
  },
  '02': {
    id: '02',
    key: 'rain-whisper',
    name: 'RAIN WHISPER',
    subtitle: 'Earthy • Fresh • Nostalgic',
    family: 'Petrichor Geosmin',
    accentColor: '#8CA0B4',
    description: 'Distilled in Kannauj using hydro-distillation into aged sandalwood base oil. Captures petrichor in its purest crystalline form — the scent of baked terracotta earth drinking the first monsoon rain.',
    notes: {
      top: ['Wet River Stone', 'Green Vetiver Sprout', 'Crisp Rainwater'],
      heart: ['Baked Kannauj Terracotta', 'Mitti Hydro-Distillate', 'Wild Mint'],
      base: ['Mysore Sandalwood Base', 'Damp Moss', 'Earthy Geosmin']
    },
    frames: [
      'public/assets/noor/rain-whisper/frame-01.webp',
      'public/assets/noor/rain-whisper/frame-02.webp',
      'public/assets/noor/rain-whisper/frame-03.webp',
      'public/assets/noor/rain-whisper/frame-04.webp',
      'public/assets/noor/rain-whisper/frame-05.webp',
      'public/assets/noor/rain-whisper/frame-06.webp'
    ]
  },
  '03': {
    id: '03',
    key: 'sandal-glow',
    name: 'SANDAL GLOW',
    subtitle: 'Warm • Woody • Refined',
    family: 'Sacred Creamy Woody',
    accentColor: '#C49A45',
    description: 'Hand-harvested sustainable Mysore Santalum album. Creamy, silken heartwood smoothed with golden almond milk, temple incense smoke, and dried white champaca petals that evoke timeless serenity.',
    notes: {
      top: ['Crushed Cardamom Pods', 'Warm Almond Milk', 'Coriander Seed'],
      heart: ['Aged Mysore Sandalwood', 'Sacred Temple Incense', 'Champaca Blossom'],
      base: ['Creamy Cedarwood', 'Ambergris Flakes', 'Bourbon Vanilla Bean']
    },
    frames: [
      'public/assets/noor/sandal-glow/frame-01.webp',
      'public/assets/noor/sandal-glow/frame-02.webp',
      'public/assets/noor/sandal-glow/frame-03.webp',
      'public/assets/noor/sandal-glow/frame-04.webp',
      'public/assets/noor/sandal-glow/frame-05.webp',
      'public/assets/noor/sandal-glow/frame-06.webp'
    ]
  },
  '04': {
    id: '04',
    key: 'white-petal',
    name: 'WHITE PETAL',
    subtitle: 'Floral • Soft • Luminous',
    family: 'Luminous Solar Floral',
    accentColor: '#95A68E',
    description: 'Harvested at 4 AM before the sun volatilizes delicate floral terpenes. White Mogra petals floating in marble courtyards, glistening with early morning dew and warmed by radiant solar musks.',
    notes: {
      top: ['Morning Dew Accord', 'Neroli Petals', 'Green Pear Skin'],
      heart: ['Indian Mogra Sambac Absolute', 'White Lily', 'Crushed Gardenia'],
      base: ['Translucent Musk', 'White Sandalwood', 'Soft Amber Glow']
    },
    frames: [
      'public/assets/noor/white-petal/frame-01.webp',
      'public/assets/noor/white-petal/frame-02.webp',
      'public/assets/noor/white-petal/frame-03.webp',
      'public/assets/noor/white-petal/frame-04.webp',
      'public/assets/noor/white-petal/frame-05.webp',
      'public/assets/noor/white-petal/frame-06.webp'
    ]
  }
};

class UnboxingScrollManager {
  constructor() {
    this.section = document.getElementById('packaging-unboxing-section');
    if (!this.section) return;

    this.activeId = '01';
    this.activeConfig = UNBOXING_FRAGRANCES['01'];
    this.timeline = null;
    this.scrollTrigger = null;
    this.preloadedImages = {};
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // DOM Elements
    this.stage = document.getElementById('unboxing-scroll-stage');
    this.frameLayers = [
      document.getElementById('unboxing-frame-1'),
      document.getElementById('unboxing-frame-2'),
      document.getElementById('unboxing-frame-3'),
      document.getElementById('unboxing-frame-4'),
      document.getElementById('unboxing-frame-5'),
      document.getElementById('unboxing-frame-6')
    ];
    this.frameImgs = [
      document.getElementById('img-frame-1'),
      document.getElementById('img-frame-2'),
      document.getElementById('img-frame-3'),
      document.getElementById('img-frame-4'),
      document.getElementById('img-frame-5'),
      document.getElementById('img-frame-6')
    ];

    this.progressBar = document.getElementById('unboxing-progress-bar');
    this.stepIndexEl = document.getElementById('unboxing-step-index');
    this.stepLabelEl = document.getElementById('unboxing-step-label');
    this.scrollCue = document.getElementById('unboxing-scroll-cue');
    this.beat6Card = document.getElementById('unboxing-beat6-editorial');

    // Video Scrub Elements
    this.videoContainer = document.getElementById('unboxing-video-container');
    this.video = document.getElementById('unboxing-scrub-video');
    this.videoSrc1440 = document.getElementById('video-src-1440');
    this.videoSrc1080 = document.getElementById('video-src-1080');
    this.videoSrcWebm = document.getElementById('video-src-webm');
    this.devNotice = document.getElementById('unboxing-dev-notice');
    this.devNoticeActiveFile = document.getElementById('dev-notice-active-file');
    this.devNoticeDismiss = document.getElementById('dev-notice-dismiss-btn');
    this.isVideoLoaded = false;

    // Controls
    this.pills = document.querySelectorAll('#unboxing-scroll-pills .unboxing-pill-btn');
    this.replayBtn = document.getElementById('unboxing-scroll-replay-btn');
    this.ctaBtn = document.getElementById('unboxing-scroll-cta-btn');

    // Card Details
    this.cardNum = document.getElementById('beat6-card-num');
    this.cardFamily = document.getElementById('beat6-card-family');
    this.cardTitle = document.getElementById('beat6-card-title');
    this.cardSubtitle = document.getElementById('beat6-card-subtitle');
    this.cardDesc = document.getElementById('beat6-card-desc');
    this.cardNotes = document.getElementById('beat6-card-notes');
    this.ctaBtnText = document.getElementById('beat6-cta-btn-text');

    this.init();
  }

  init() {
    // Register GSAP ScrollTrigger plugin
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    this.setupListeners();
    this.setupVideoScrubPlayer();
    this.preloadFragrance(this.activeId);
    this.updateCardContent(this.activeConfig);
    this.checkVideoAvailability(this.activeConfig);
    this.buildScrollTimeline();
  }

  preloadFragrance(id) {
    const config = UNBOXING_FRAGRANCES[id];
    if (!config) return;
    if (this.preloadedImages[id]) return;

    this.preloadedImages[id] = config.frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }

  setupListeners() {
    // Fragrance Pills
    this.pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.dataset.fragranceId;
        if (id && id !== this.activeId) {
          this.switchFragrance(id);
        }
      });
    });

    // Replay Button
    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', () => {
        this.replayUnboxing();
      });
    }

    // CTA Button
    if (this.ctaBtn) {
      this.ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.openProductModal === 'function') {
          window.openProductModal(this.activeId);
        }
      });
    }

    // Window resize
    window.addEventListener('resize', () => {
      if (this.scrollTrigger) {
        this.scrollTrigger.refresh();
      }
    }, { passive: true });
  }

  updateCardContent(config) {
    if (this.cardNum) this.cardNum.textContent = config.id;
    if (this.cardFamily) this.cardFamily.textContent = config.family.toUpperCase();
    if (this.cardTitle) this.cardTitle.textContent = config.name;
    if (this.cardSubtitle) this.cardSubtitle.textContent = config.subtitle;
    if (this.cardDesc) this.cardDesc.textContent = config.description;

    if (this.cardNotes) {
      this.cardNotes.innerHTML = '';
      const allNotes = [...config.notes.top.slice(0, 1), ...config.notes.heart.slice(0, 1), ...config.notes.base.slice(0, 1)];
      allNotes.forEach(n => {
        const span = document.createElement('span');
        span.className = 'beat6-pill';
        span.textContent = n;
        this.cardNotes.appendChild(span);
      });
    }

    if (this.ctaBtnText) {
      this.ctaBtnText.textContent = `DISCOVER ${config.name} →`;
    }
  }

  setupVideoScrubPlayer() {
    if (this.devNoticeDismiss && this.devNotice) {
      this.devNoticeDismiss.addEventListener('click', () => {
        this.devNotice.classList.add('dismissed');
      });
    }

    if (!this.video) return;

    this.video.addEventListener('loadeddata', () => {
      this.onVideoReady();
    });

    this.video.addEventListener('canplay', () => {
      this.onVideoReady();
    });

    this.video.addEventListener('error', () => {
      this.onVideoUnavailable();
    });
  }

  onVideoReady() {
    if (this.video && this.video.duration > 0) {
      this.isVideoLoaded = true;
      if (this.stage) this.stage.classList.add('video-mode-active');
      if (this.devNotice) this.devNotice.classList.add('dismissed');
      console.log('Continuous Video Scrub Active for:', this.activeConfig.name, `(${this.video.duration.toFixed(1)}s)`);
    }
  }

  onVideoUnavailable() {
    this.isVideoLoaded = false;
    if (this.stage) this.stage.classList.remove('video-mode-active');
  }

  checkVideoAvailability(config) {
    if (!this.video) return;
    
    // Update dev notice UI with missing file targets
    if (this.devNoticeActiveFile) {
      this.devNoticeActiveFile.innerHTML = `<code>public/assets/noor/video/${config.key}-1080.mp4</code>`;
    }

    // Set video sources
    if (this.videoSrc1440) this.videoSrc1440.src = `public/assets/noor/video/${config.key}-1440.mp4`;
    if (this.videoSrc1080) this.videoSrc1080.src = `public/assets/noor/video/${config.key}-1080.mp4`;
    if (this.videoSrcWebm) this.videoSrcWebm.src = `public/assets/noor/video/${config.key}-1080.webm`;
    this.video.poster = config.frames[0];
    this.video.load();
  }

  updateFrameSources(config) {
    config.frames.forEach((src, idx) => {
      if (this.frameImgs[idx]) {
        this.frameImgs[idx].src = src;
      }
    });
  }

  switchFragrance(id) {
    const config = UNBOXING_FRAGRANCES[id];
    if (!config) return;

    this.activeId = id;
    this.activeConfig = config;

    // Update Pill UI
    this.pills.forEach(p => {
      p.classList.toggle('active', p.dataset.fragranceId === id);
    });

    // Preload frames
    this.preloadFragrance(id);

    // Swap images, video sources & editorial
    this.updateFrameSources(config);
    this.updateCardContent(config);
    this.checkVideoAvailability(config);

    // 1. Clean up old timeline and scrollTrigger (reverting pin spacer)
    if (this.scrollTrigger) {
      this.scrollTrigger.revert();
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    // 2. Reset scroll progress to start of section without smooth scroll delay
    const targetTop = this.section ? this.section.offsetTop : 0;
    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, targetTop);

    // 3. Rebuild timeline and trigger refresh
    this.buildScrollTimeline();
    if (this.timeline) {
      this.timeline.progress(0);
    }
    if (this.video) {
      this.video.currentTime = 0;
    }
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
    document.documentElement.style.scrollBehavior = prevScrollBehavior;
    this.handleProgressUpdate(0);
  }

  replayUnboxing() {
    const targetTop = this.scrollTrigger ? this.scrollTrigger.start : (this.section ? this.section.offsetTop : 0);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    if (this.timeline) {
      this.timeline.progress(0);
    }
    if (this.video) {
      this.video.currentTime = 0;
    }
    this.handleProgressUpdate(0);
  }

  buildScrollTimeline() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger not loaded, fallback static view applied.');
      this.frameLayers.forEach((l, i) => {
        if (l) l.style.opacity = (i === 2) ? '1' : '0';
      });
      return;
    }

    const gsap = window.gsap;
    const getPinDistance = () => window.innerWidth <= 768 ? (window.innerHeight * 3) : (window.innerHeight * 5);

    if (this.reducedMotion) {
      // Reduced motion: unpinned gentle display
      this.frameLayers.forEach((l, i) => {
        if (l) l.style.opacity = (i === 2 || i === 4) ? '1' : '0';
      });
      if (this.beat6Card) this.beat6Card.style.opacity = '1';
      return;
    }

    // Reset initial layer states: Frame 0 active, others 0
    gsap.set(this.frameLayers[0], { opacity: 1, scale: 1, filter: 'blur(0px)' });
    for (let i = 1; i < 6; i++) {
      if (this.frameLayers[i]) {
        gsap.set(this.frameLayers[i], { opacity: 0, scale: 1, filter: 'blur(0px)' });
      }
    }
    if (this.beat6Card) {
      gsap.set(this.beat6Card, { opacity: 0, y: 35, pointerEvents: 'none' });
    }

    // Master scrub timeline (total duration 100 units = percentage progress)
    this.timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power1.inOut' }
    });

    // Beat 1 (0% - 15%): Closed box (Frame 0 remains fully visible)
    // Beat 1 -> Beat 2 crossfade (15% - 25%) -> Lid opens (Frame 1 dominant through 35%)
    this.timeline.to(this.frameLayers[0], { opacity: 0, scale: 1.02, filter: 'blur(1px)', duration: 10 }, 15);
    this.timeline.to(this.frameLayers[1], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 10 }, 15);

    // Beat 2 -> Beat 3 crossfade (35% - 45%) -> Bottle rises out of box (Primary beat: Frame 2 dominant through 55%)
    this.timeline.to(this.frameLayers[1], { opacity: 0, scale: 1.02, filter: 'blur(1px)', duration: 10 }, 35);
    this.timeline.to(this.frameLayers[2], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 10 }, 35);

    // Beat 3 -> Beat 4 crossfade (55% - 62%) -> Bottle rotates (Frame 3 dominant through 70%)
    this.timeline.to(this.frameLayers[2], { opacity: 0, scale: 1.02, filter: 'blur(1px)', duration: 7 }, 55);
    this.timeline.to(this.frameLayers[3], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 7 }, 55);

    // Beat 4 -> Beat 5 crossfade (70% - 77%) -> Bottle and box together (Frame 4 dominant through 85%)
    this.timeline.to(this.frameLayers[3], { opacity: 0, scale: 1.02, filter: 'blur(1px)', duration: 7 }, 70);
    this.timeline.to(this.frameLayers[4], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 7 }, 70);

    // Beat 5 -> Beat 6 crossfade (85% - 92%) -> Scent contours (Frame 5 dominant through 100%)
    this.timeline.to(this.frameLayers[4], { opacity: 0, scale: 1.02, filter: 'blur(1px)', duration: 7 }, 85);
    this.timeline.to(this.frameLayers[5], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 7 }, 85);

    // Beat 6: Real HTML Editorial Card reveal
    this.timeline.to(this.beat6Card, {
      opacity: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 10
    }, 88);

    // Set timeline anchor to exactly 100
    this.timeline.set({}, {}, 100);

    // Create ScrollTrigger pinning stage
    this.scrollTrigger = window.ScrollTrigger.create({
      trigger: this.section,
      start: 'top top',
      end: () => `+=${getPinDistance()}`,
      pin: this.stage,
      pinSpacing: true,
      scrub: 0.8,
      animation: this.timeline,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        this.handleProgressUpdate(self.progress);
      }
    });
  }

  handleProgressUpdate(progress) {
    // 0. Continuous Video Scrub if video asset is active
    if (this.isVideoLoaded && this.video && this.video.duration > 0) {
      const targetTime = Math.min(Math.max(progress * this.video.duration, 0), this.video.duration);
      if (typeof this.video.fastSeek === 'function') {
        this.video.fastSeek(targetTime);
      } else if (Math.abs(this.video.currentTime - targetTime) > 0.04) {
        this.video.currentTime = targetTime;
      }
    }

    // 1. Progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(progress * 100, 100).toFixed(1)}%`;
    }

    // 2. Hide scroll cue
    if (this.scrollCue) {
      this.scrollCue.style.opacity = progress > 0.08 ? '0' : '1';
    }

    // 3. Step indicator label
    let step = '01';
    let label = '01 CLOSED BOX';

    if (progress < 0.15) {
      step = '01 / 06';
      label = '01 CLOSED BOX';
    } else if (progress < 0.35) {
      step = '02 / 06';
      label = '02 LID OPENS';
    } else if (progress < 0.55) {
      step = '03 / 06';
      label = '03 BOTTLE RISES';
    } else if (progress < 0.70) {
      step = '04 / 06';
      label = '04 BOTTLE ROTATES';
    } else if (progress < 0.85) {
      step = '05 / 06';
      label = '05 BOTTLE & BOX TOGETHER';
    } else {
      step = '06 / 06';
      label = '06 SCENT CONTOURS • REVEAL';
    }

    if (this.stepIndexEl) this.stepIndexEl.textContent = step;
    if (this.stepLabelEl) this.stepLabelEl.textContent = label;
  }
}

// Global initialization
let unboxingScrollInstance = null;

export function initUnboxingScroll() {
  if (!unboxingScrollInstance) {
    unboxingScrollInstance = new UnboxingScrollManager();
  }
  return unboxingScrollInstance;
}
