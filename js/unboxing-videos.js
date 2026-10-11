/**
 * NOOR - BEYOND SCENT
 * Unboxing Experience Controller
 * High-definition Video Showcase for Four Approved Fragrances
 */

export const UNBOXING_DATA = {
  '01': {
    id: '01',
    name: 'MIDNIGHT MUSK',
    subtitle: 'Dark • Sensual • Mysterious',
    family: 'Oriental Amber Musk',
    video: 'assets/videos/midnight-musk-unboxing.mp4',
    poster: 'public/assets/noor/midnight-musk/frame-01.webp',
    story: 'Distilled under moonless skies. Dark smoked resins, golden amber embers, and sensual botanical musk unfold in an intimate veil that warms to the skin over hours.',
    notes: ['Black Cardamom', 'Kasturi Accord', 'Aged Oud']
  },
  '02': {
    id: '02',
    name: 'RAIN WHISPER',
    subtitle: 'Earthy • Fresh • Nostalgic',
    family: 'Petrichor Geomin',
    video: 'assets/videos/rain-whisper-unboxing.mp4',
    poster: 'public/assets/noor/rain-whisper/frame-01.webp',
    story: 'The primordial scent of the first monsoon rain touching sun-baked clay in Kannauj. Pure petrichor distilled into aged sandalwood base oil.',
    notes: ['Wet River Stone', 'Terracotta Mitti', 'Geosmin Moss']
  },
  '03': {
    id: '03',
    name: 'SANDAL GLOW',
    subtitle: 'Warm • Woody • Refined',
    family: 'Sacred Creamy Woody',
    video: 'assets/videos/sandal-glow-unboxing.mp4',
    poster: 'public/assets/noor/sandal-glow/frame-01.webp',
    story: 'Hand-harvested sustainable Mysore Santalum album. Creamy, silken wood smoothed with golden almond milk, temple incense smoke, and dried white champaca petals.',
    notes: ['Mysore Sandalwood', 'Warm Almond Milk', 'Sacred Incense']
  },
  '04': {
    id: '04',
    name: 'WHITE PETAL',
    subtitle: 'Floral • Soft • Luminous',
    family: 'Luminous Jasmine Blossom',
    video: 'assets/videos/white-petal-unboxing.mp4',
    poster: 'public/assets/noor/white-petal/frame-01.webp',
    story: 'Arabian Jasmine sambac picked in the deep stillness before dawn. Floating weightless in marble basins, exuding a luminescence that feels like cooled silver silk.',
    notes: ['Dawn Jasmine', 'Silver Starfruit', 'White Tuberose']
  }
};

export function initUnboxingVideos() {
  const section = document.getElementById('packaging-unboxing-section');
  if (!section) return;

  const mainVideo = document.getElementById('unboxing-main-video');
  const mainVideoSource = document.getElementById('unboxing-video-source');
  const playBtn = document.getElementById('unboxing-video-play-btn');
  const muteBtn = document.getElementById('unboxing-video-mute-btn');
  const replayBtn = document.getElementById('unboxing-video-replay-btn');
  const pills = section.querySelectorAll('.unboxing-pill-btn');
  const cards = section.querySelectorAll('.unboxing-preview-card');

  const titleEl = document.getElementById('unboxing-active-title');
  const subtitleEl = document.getElementById('unboxing-active-subtitle');
  const familyEl = document.getElementById('unboxing-active-family');
  const numEl = document.getElementById('unboxing-active-num');
  const descEl = document.getElementById('unboxing-active-desc');
  const notesEl = document.getElementById('unboxing-active-notes');
  const ctaBtn = document.getElementById('unboxing-discover-btn');

  let activeId = '01';

  function switchFragrance(id) {
    if (!UNBOXING_DATA[id]) return;
    activeId = id;
    const data = UNBOXING_DATA[id];

    // 1. Update pills
    pills.forEach(p => {
      if (p.getAttribute('data-fragrance-id') === id) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // 2. Update preview cards
    cards.forEach(c => {
      if (c.getAttribute('data-fragrance-id') === id) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // 3. Update Text Content with subtle fade
    if (titleEl) titleEl.textContent = data.name;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;
    if (familyEl) familyEl.textContent = data.family;
    if (numEl) numEl.textContent = `${data.id} · SIGNATURE COFFRET`;
    if (descEl) descEl.textContent = data.story;

    if (notesEl) {
      notesEl.innerHTML = data.notes.map(n => `<span class="unboxing-note-pill">${n}</span>`).join('');
    }

    if (ctaBtn) {
      ctaBtn.setAttribute('data-perfume-id', data.id);
      const span = ctaBtn.querySelector('span');
      if (span) span.textContent = `DISCOVER ${data.name} →`;
    }

    // 4. Update Main Video
    if (mainVideo && mainVideoSource) {
      mainVideo.style.opacity = '0.5';
      mainVideoSource.src = data.video;
      mainVideo.load();
      mainVideo.play().catch(() => {});
      setTimeout(() => {
        mainVideo.style.opacity = '1';
      }, 250);
    }
  }

  // Pill click handlers
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const id = pill.getAttribute('data-fragrance-id');
      switchFragrance(id);
    });
  });

  // Card click handlers
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-fragrance-id');
      switchFragrance(id);
    });
  });

  // Controls
  if (playBtn && mainVideo) {
    playBtn.addEventListener('click', () => {
      if (mainVideo.paused) {
        mainVideo.play();
        playBtn.innerHTML = '❚❚';
        playBtn.setAttribute('aria-label', 'Pause video');
      } else {
        mainVideo.pause();
        playBtn.innerHTML = '▶';
        playBtn.setAttribute('aria-label', 'Play video');
      }
    });

    mainVideo.addEventListener('play', () => {
      playBtn.innerHTML = '❚❚';
    });
    mainVideo.addEventListener('pause', () => {
      playBtn.innerHTML = '▶';
    });
  }

  if (muteBtn && mainVideo) {
    muteBtn.addEventListener('click', () => {
      mainVideo.muted = !mainVideo.muted;
      muteBtn.innerHTML = mainVideo.muted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', mainVideo.muted ? 'Unmute video' : 'Mute video');
    });
  }

  if (replayBtn && mainVideo) {
    replayBtn.addEventListener('click', () => {
      mainVideo.currentTime = 0;
      mainVideo.play();
    });
  }

  // Discovery CTA Click
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      const pid = ctaBtn.getAttribute('data-perfume-id') || activeId;
      if (window.openProductModal) {
        window.openProductModal(pid);
      }
    });
  }

  // Ensure all mini preview videos play muted in a loop
  const miniVideos = section.querySelectorAll('.unboxing-preview-video');
  miniVideos.forEach(v => {
    v.muted = true;
    v.play().catch(() => {});
  });

  // Initial playback
  if (mainVideo) {
    mainVideo.play().catch(() => {});
  }
}
