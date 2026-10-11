/**
 * NOOR - BEYOND SCENT
 * #SEEYOURSCENT Interactive Campaign & Visual Aura Generator
 * "If your scent had a colour, what would it be?"
 */

import { PERFUMES_DATA } from './perfumes-data.js';

export class SeeYourScentGenerator {
  constructor() {
    this.container = document.getElementById('see-your-scent-app');
    if (!this.container) return;

    this.selections = {
      color: null,
      mood: null,
      texture: null,
      memory: null
    };

    this.currentStep = 1;
    this.totalSteps = 4;

    this.options = {
      colors: [
        { id: 'gold', label: 'Warm Amber Gold', hex: '#D8C09A', aura: 'rgba(216, 192, 154, 0.45)', match: '03' },
        { id: 'terracotta', label: 'Wet Terracotta', hex: '#A86D51', aura: 'rgba(168, 109, 81, 0.45)', match: '02' },
        { id: 'ivory', label: 'Moonlit Pearl Ivory', hex: '#ECE5DA', aura: 'rgba(236, 229, 218, 0.65)', match: '04' },
        { id: 'espresso', label: 'Nocturne Espresso', hex: '#2A211B', aura: 'rgba(42, 33, 27, 0.65)', match: '01' },
        { id: 'crimson', label: 'Velvet Rose Crimson', hex: '#873B49', aura: 'rgba(135, 59, 73, 0.45)', match: '05' },
        { id: 'emerald', label: 'Mystic Jade Forest', hex: '#3E5645', aura: 'rgba(62, 86, 69, 0.45)', match: '10' }
      ],
      moods: [
        { id: 'enigmatic', label: 'Sensual & Enigmatic', tag: 'Shadows & Whispers' },
        { id: 'grounded', label: 'Meditative & Grounded', tag: 'Stillness of Ancient Temples' },
        { id: 'nostalgic', label: 'Nostalgic & Rain-washed', tag: 'First Monsoon Droplets' },
        { id: 'luminous', label: 'Ethereal & Luminous', tag: 'Silk Warmed by Solar Light' },
        { id: 'regal', label: 'Imperial & Sovereign', tag: 'Aged Woods & Spun Gold' }
      ],
      textures: [
        { id: 'silk', label: 'Raw Handspun Silk', desc: 'Weightless, flowing, cooling to the skin' },
        { id: 'clay', label: 'Sun-baked Terracotta', desc: 'Porous, mineral, drenched in rain' },
        { id: 'wood', label: 'Polished Sandalwood Heartwood', desc: 'Warm, oily, soothing and enduring' },
        { id: 'velvet', label: 'Heavy Crimson Velvet', desc: 'Deep, enveloping, lavish and romantic' },
        { id: 'petals', label: 'Dew-drenched Jasmine Petals', desc: 'Delicate, crystalline, bursting with nectar' }
      ],
      memories: [
        { id: 'monsoon', label: 'Dusk during the First Monsoon', poetic: 'Kannauj stills breathing steam into the dark earth.' },
        { id: 'courtyard', label: 'Midnight Marble Courtyard', poetic: 'Jasmine blossoms opening under cold starlight.' },
        { id: 'temple', label: 'Sanctum Lit by Golden Diya Lamps', poetic: 'A quiet surrender where time ceases to advance.' },
        { id: 'orchard', label: 'Morning Sun Piercing Pomelo Groves', poetic: 'Crisp green breeze through mountain citrus orchards.' }
      ]
    };

    this.render();
  }

  render() {
    this.renderStep();
  }

  renderStep() {
    let contentHtml = '';

    if (this.currentStep <= 4) {
      contentHtml = `
        <div class="sys-step-header">
          <div class="sys-progress-track">
            ${[1, 2, 3, 4].map(s => `
              <div class="sys-progress-pill ${s <= this.currentStep ? 'active' : ''}"></div>
            `).join('')}
          </div>
          <span class="sys-step-counter">STAGE 0${this.currentStep} OF 04</span>
        </div>
      `;

      if (this.currentStep === 1) {
        contentHtml += `
          <h3 class="sys-step-title">If your scent had a colour, what would it be?</h3>
          <p class="sys-step-sub">Colour is the visual frequency of an invisible aroma.</p>
          <div class="sys-options-grid color-grid">
            ${this.options.colors.map(c => `
              <button class="sys-color-card ${this.selections.color?.id === c.id ? 'selected' : ''}" data-color-id="${c.id}">
                <span class="sys-color-swatch" style="background: ${c.hex};"></span>
                <span class="sys-color-name">${c.label}</span>
              </button>
            `).join('')}
          </div>
        `;
      } else if (this.currentStep === 2) {
        contentHtml += `
          <h3 class="sys-step-title">What emotional atmosphere does it evoke?</h3>
          <p class="sys-step-sub">Fragrance begins in the realm of interior feeling.</p>
          <div class="sys-options-grid mood-grid">
            ${this.options.moods.map(m => `
              <button class="sys-choice-card ${this.selections.mood?.id === m.id ? 'selected' : ''}" data-mood-id="${m.id}">
                <span class="sys-choice-title">${m.label}</span>
                <span class="sys-choice-desc">${m.tag}</span>
              </button>
            `).join('')}
          </div>
        `;
      } else if (this.currentStep === 3) {
        contentHtml += `
          <h3 class="sys-step-title">What texture would your skin feel?</h3>
          <p class="sys-step-sub">The tactile sensation your imagination touches first.</p>
          <div class="sys-options-grid texture-grid">
            ${this.options.textures.map(t => `
              <button class="sys-choice-card ${this.selections.texture?.id === t.id ? 'selected' : ''}" data-texture-id="${t.id}">
                <span class="sys-choice-title">${t.label}</span>
                <span class="sys-choice-desc">${t.desc}</span>
              </button>
            `).join('')}
          </div>
        `;
      } else if (this.currentStep === 4) {
        contentHtml += `
          <h3 class="sys-step-title">Which memory resonates most deeply?</h3>
          <p class="sys-step-sub">The anchor of an unforgettable scent signature.</p>
          <div class="sys-options-grid memory-grid">
            ${this.options.memories.map(m => `
              <button class="sys-choice-card ${this.selections.memory?.id === m.id ? 'selected' : ''}" data-memory-id="${m.id}">
                <span class="sys-choice-title">${m.label}</span>
                <span class="sys-choice-desc">${m.poetic}</span>
              </button>
            `).join('')}
          </div>
        `;
      }
    } else {
      // Step 5: Render Generated Moodboard Card!
      contentHtml = this.renderResultMoodboard();
    }

    this.container.innerHTML = contentHtml;
    this.bindEvents();
  }

  renderResultMoodboard() {
    const col = this.selections.color || this.options.colors[0];
    const mood = this.selections.mood || this.options.moods[0];
    const texture = this.selections.texture || this.options.textures[0];
    const mem = this.selections.memory || this.options.memories[0];

    // Find recommended fragrance match
    let matchedPerfume = PERFUMES_DATA.find(p => p.id === col.match) || PERFUMES_DATA[0];

    return `
      <div class="sys-result-wrapper" id="sys-aura-card">
        <div class="sys-result-badge">YOUR VISUAL SCENT PROFILE</div>
        <h3 class="sys-result-title">“${mood.label}”</h3>
        <p class="sys-result-manifesto">
          Your scent is rendered in <strong>${col.label}</strong>, draped in <strong>${texture.label.toLowerCase()}</strong>, and anchored in the memory of <em>${mem.label.toLowerCase()}</em>.
        </p>

        <div class="sys-aura-artpiece" style="background: radial-gradient(circle at 60% 40%, ${col.aura} 0%, rgba(42, 33, 27, 0.85) 75%), #2A211B;">
          <div class="sys-aura-orb" style="background: ${col.hex}; box-shadow: 0 0 90px 40px ${col.aura};"></div>
          
          <div class="sys-aura-content">
            <div class="sys-bottle-preview">
              <img src="${matchedPerfume.image}" alt="${matchedPerfume.name}" class="sys-bottle-img">
            </div>
            <div class="sys-aura-meta">
              <span class="sys-matched-tag">DISCOVERED FRAGRANCE MATCH</span>
              <h4 class="sys-matched-name">${matchedPerfume.number} ${matchedPerfume.name}</h4>
              <p class="sys-matched-sub">${matchedPerfume.subtitle}</p>
              <p class="sys-matched-quote">“${matchedPerfume.quote}”</p>
              <div class="sys-notes-chips">
                ${matchedPerfume.heartNotes.map(n => `<span class="note-chip">${n}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="sys-actions-row">
          <button class="noor-btn gold-line clickable" id="sys-open-perfume" data-perfume-id="${matchedPerfume.id}">
            <span>EXPERIENCE ${matchedPerfume.name}</span>
          </button>
          <button class="noor-btn outline clickable" id="sys-share-btn">
            <span>SHARE YOUR SCENT</span>
          </button>
          <button class="noor-btn text-only clickable" id="sys-restart-btn">
            <span>START OVER</span>
          </button>
        </div>

        <div id="sys-share-toast" class="sys-share-toast hidden">
          <span>Aura link copied to clipboard. Share your visual fragrance.</span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Color click
    this.container.querySelectorAll('[data-color-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-color-id');
        this.selections.color = this.options.colors.find(c => c.id === id);
        this.currentStep = 2;
        this.renderStep();
      });
    });

    // Mood click
    this.container.querySelectorAll('[data-mood-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-mood-id');
        this.selections.mood = this.options.moods.find(m => m.id === id);
        this.currentStep = 3;
        this.renderStep();
      });
    });

    // Texture click
    this.container.querySelectorAll('[data-texture-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-texture-id');
        this.selections.texture = this.options.textures.find(t => t.id === id);
        this.currentStep = 4;
        this.renderStep();
      });
    });

    // Memory click
    this.container.querySelectorAll('[data-memory-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-memory-id');
        this.selections.memory = this.options.memories.find(m => m.id === id);
        this.currentStep = 5;
        this.renderStep();
      });
    });

    // Result buttons
    const restartBtn = document.getElementById('sys-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.currentStep = 1;
        this.selections = { color: null, mood: null, texture: null, memory: null };
        this.renderStep();
      });
    }

    const openPerfumeBtn = document.getElementById('sys-open-perfume');
    if (openPerfumeBtn) {
      openPerfumeBtn.addEventListener('click', () => {
        const perfumeId = openPerfumeBtn.getAttribute('data-perfume-id');
        window.dispatchEvent(new CustomEvent('noor:open-perfume', { detail: { id: perfumeId } }));
      });
    }

    const shareBtn = document.getElementById('sys-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const toast = document.getElementById('sys-share-toast');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`${window.location.origin}#SEEYOURSCENT - My scent is ${this.selections.color?.label} and ${this.selections.mood?.label}. Discover NOOR at ${window.location.href}`);
        }
        if (toast) {
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3200);
        }
      });
    }
  }
}
